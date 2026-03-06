const { HUGGING_FACE_API_KEY, HUGGING_FACE_MODEL } = require("../../config/env");

const HF_ENDPOINT = "https://router.huggingface.co/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 25000;

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

async function askAssistant(message, imageUrl) {
  if (!HUGGING_FACE_API_KEY) {
    throw createHttpError(500, "HUGGING_FACE_API_KEY is missing on the backend");
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
    const response = await fetch(HF_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
      },
      body: JSON.stringify({
        model: HUGGING_FACE_MODEL,
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
      signal: controller.signal,
    });

    const data = await response.json();
    if (!response.ok) {
      const hfHeaderError = response.headers.get("x-error-message");
      const hfError = hfHeaderError || data?.error?.message || data?.error;
      const suffix = hfError ? `: ${hfError}` : "";
      throw createHttpError(response.status, `Hugging Face request failed${suffix}`);
    }
    const reply = extractReply(data);
    if (!reply) {
      throw createHttpError(502, "Received empty reply from Hugging Face");
    }
    return reply;
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
