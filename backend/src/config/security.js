const env = require("./env");

const isProd = env.NODE_ENV === "production";

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no Origin header (server-to-server, health checks, curl)
    if (!origin) return callback(null, true);
    if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  domain: env.COOKIE_DOMAIN,
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

module.exports = { corsOptions, refreshCookieOptions };
