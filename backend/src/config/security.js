const env = require("./env");

const isProd = env.NODE_ENV === "production";

function isVercelOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no Origin header (server-to-server, health checks, curl)
    if (!origin) return callback(null, true);
    if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);

    // Allow Vercel preview URLs in production to avoid CORS failures on preview deploys.
    if (isProd && isVercelOrigin(origin)) return callback(null, true);

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
