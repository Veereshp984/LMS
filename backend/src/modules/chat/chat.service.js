const { HUGGING_FACE_API_KEY, HUGGING_FACE_MODEL } = require("../../config/env");

const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 25000;
const FALLBACK_MODELS = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "mistralai/Mistral-7B-Instruct-v0.3",
  "Qwen/Qwen2.5-7B-Instruct",
];

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function extractReply(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    const textPart = content.find((part) => part && part.type === "text" && part.text);
    if (textPart) return String(textPart.text).trim();
  }
  const nestedError = data?.error?.message || data?.error;
  if (typeof nestedError === "string") {
    throw createHttpError(502, `Hugging Face error: ${nestedError}`);
  }
  throw createHttpError(502, "Unexpected response from Hugging Face");
}

function getOrderedModels() {
  const preferred = typeof HUGGING_FACE_MODEL === "string" ? HUGGING_FACE_MODEL.trim() : "";
  const list = [preferred, ...FALLBACK_MODELS].filter(Boolean);
  return [...new Set(list)];
}

function isUnsupportedModelError(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return lower.includes("not supported by any provider") || lower.includes("unknown model");
}

async function requestModelResponse({ model, userContent, signal }) {
  const response = await fetch(HF_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are LearnSphere assistant. Reply in plain, simple text. Keep the answer concise unless the user asks for details. Avoid section headers like Key Points/Next Actions.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      max_tokens: 220,
      temperature: 0.6,
      stream: false,
    }),
    signal,
  });

  const data = await response.json();
  return { response, data };
}

async function askAssistant(message, imageUrl) {
  if (!HUGGING_FACE_API_KEY) {
    throw createHttpError(500, "Hugging Face API key is missing. Set one of: HUGGING_FACE_API_KEY, HF_API_KEY, HF_TOKEN, HUGGINGFACEHUB_API_TOKEN");
  }

  const userContent = imageUrl
    ? [
        { type: "image_url", image_url: { url: imageUrl } },
        { type: "text", text: message },
      ]
    : message;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const models = getOrderedModels();
    let lastError = null;

    for (const model of models) {
      const { response, data } = await requestModelResponse({
        model,
        userContent,
        signal: controller.signal,
      });

      if (!response.ok) {
        const hfHeaderError = response.headers.get("x-error-message");
        const hfError = hfHeaderError || data?.error?.message || data?.error;
        const suffix = hfError ? `: ${hfError}` : "";

        if (isUnsupportedModelError(hfError)) {
          lastError = createHttpError(response.status, `Hugging Face request failed${suffix}`);
          continue;
        }

        throw createHttpError(response.status, `Hugging Face request failed${suffix}`);
      }

      const reply = extractReply(data);
      if (!reply) {
        throw createHttpError(502, "Received empty reply from Hugging Face");
      }
      return reply;
    }

    throw lastError || createHttpError(502, "No supported Hugging Face model available");
  } catch (err) {
    if (err.name === "AbortError") {
      throw createHttpError(504, "Chat request timed out");
    }
    if (err instanceof SyntaxError) {
      throw createHttpError(502, "Invalid JSON response from Hugging Face");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { askAssistant };
