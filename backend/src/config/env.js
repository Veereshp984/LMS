const dotenv = require("dotenv");

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
  HUGGING_FACE_MODEL: process.env.HUGGING_FACE_MODEL || "meta-llama/Llama-3.1-8B-Instruct",
  RAZORPAY_KEY_ID: firstNonEmpty(process.env.RAZORPAY_KEY_ID, process.env.RZP_KEY_ID),
  RAZORPAY_KEY_SECRET: firstNonEmpty(
    process.env.RAZORPAY_KEY_SECRET,
    process.env.RZP_KEY_SECRET
  ),
};
