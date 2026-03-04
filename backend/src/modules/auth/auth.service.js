const db = require("../../config/db");
const userModel = require("../users/user.model");
const { hashPassword, comparePassword } = require("../../utils/password");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../../utils/jwt");

function toPublicUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

async function createRefreshTokenRow(userId, refreshToken) {
  const token_hash = hashToken(refreshToken);
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db("refresh_tokens").insert({
    user_id: userId,
    token_hash,
    expires_at,
    created_at: new Date(),
  });
}

async function register({ email, password, name }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const error = new Error("Email already exists");
    error.status = 409;
    throw error;
  }
  const password_hash = await hashPassword(password);
  const user = await userModel.createUser({ email, password_hash, name });
  const accessToken = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);
  await createRefreshTokenRow(user.id, refreshToken);
  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }
  const storedHash = user.password_hash || user.password;
  if (!storedHash) {
    const error = new Error("User password is not configured");
    error.status = 500;
    throw error;
  }
  const ok = await comparePassword(password, storedHash);
  if (!ok) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }
  const accessToken = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);
  await createRefreshTokenRow(user.id, refreshToken);
  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    throw error;
  }
  const token_hash = hashToken(refreshToken);
  const row = await db("refresh_tokens")
    .where({ user_id: Number(payload.sub), token_hash })
    .whereNull("revoked_at")
    .andWhere("expires_at", ">", db.fn.now())
    .first();

  if (!row) {
    const error = new Error("Refresh token expired or revoked");
    error.status = 401;
    throw error;
  }
  const user = await userModel.findById(Number(payload.sub));
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  const accessToken = signAccessToken(user);
  return { accessToken, user: toPublicUser(user) };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  const token_hash = hashToken(refreshToken);
  await db("refresh_tokens")
    .where({ token_hash })
    .whereNull("revoked_at")
    .update({ revoked_at: new Date() });
}

module.exports = { register, login, refresh, logout };
