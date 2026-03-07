const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function firstNonEmpty(...values) {
  return values.map((value) => (typeof value === "string" ? value.trim() : "")).find(Boolean) || "";
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function loadRazorpayKeysFromCsv() {
  const candidates = [
    path.resolve(process.cwd(), "api-keys.csv"),
    path.resolve(process.cwd(), "..", "api-keys.csv"),
    path.resolve(process.cwd(), "backend", "api-keys.csv"),
    path.resolve(process.cwd(), "..", "backend", "api-keys.csv"),
    path.resolve(__dirname, "..", "..", "api-keys.csv"),
    path.resolve(__dirname, "..", "..", "..", "..", "api-keys.csv"),
    path.resolve(__dirname, "..", "..", "..", "api-keys.csv"),
  ];
  const keyIdHeaders = new Set(["key_id", "razorpay_key_id", "rzp_key_id"]);
  const keySecretHeaders = new Set(["key_secret", "razorpay_key_secret", "rzp_key_secret"]);

  for (const filePath of Array.from(new Set(candidates))) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const lines = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      if (lines.length < 2) continue;

      const headers = splitCsvLine(lines[0]).map((h) => h.replace(/^\uFEFF/, "").trim().toLowerCase());
      const keyIdIndex = headers.findIndex((header) => keyIdHeaders.has(header));
      const keySecretIndex = headers.findIndex((header) => keySecretHeaders.has(header));
      if (keyIdIndex < 0 || keySecretIndex < 0) continue;

      for (let i = 1; i < lines.length; i += 1) {
        const values = splitCsvLine(lines[i]);
        const keyId = values[keyIdIndex] || "";
        const keySecret = values[keySecretIndex] || "";
        if (keyId && keySecret) return { keyId, keySecret };
      }
    } catch (error) {
      // Ignore malformed CSV files and try next candidate.
    }
  }

  return { keyId: "", keySecret: "" };
}

const csvKeys = loadRazorpayKeysFromCsv();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),
  DB_HOST: required("DB_HOST"),
  DB_PORT: Number(required("DB_PORT")),
  DB_NAME: required("DB_NAME"),
  DB_USER: required("DB_USER"),
  DB_PASSWORD: required("DB_PASSWORD"),
  DB_SSL: String(process.env.DB_SSL || "true").toLowerCase() === "true",
  DB_SSL_REJECT_UNAUTHORIZED:
    String(process.env.DB_SSL_REJECT_UNAUTHORIZED || "false").toLowerCase() === "true",
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  CORS_ORIGIN: required("CORS_ORIGIN"),
  CORS_ORIGINS: required("CORS_ORIGIN")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || "localhost",
  HUGGING_FACE_API_KEY: firstNonEmpty(
    process.env.HUGGING_FACE_API_KEY,
    process.env.HF_API_KEY,
    process.env.HF_TOKEN,
    process.env.HUGGINGFACEHUB_API_TOKEN
  ),
  HUGGING_FACE_MODEL: process.env.HUGGING_FACE_MODEL || "Qwen/Qwen3.5-0.8B",
  RAZORPAY_KEY_ID: firstNonEmpty(
    process.env.RAZORPAY_KEY_ID,
    process.env.RZP_KEY_ID,
    csvKeys.keyId
  ),
  RAZORPAY_KEY_SECRET: firstNonEmpty(
    process.env.RAZORPAY_KEY_SECRET,
    process.env.RZP_KEY_SECRET,
    csvKeys.keySecret
  ),
};
