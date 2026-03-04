const authService = require("./auth.service");
const { refreshCookieOptions } = require("../../config/security");
const { validateRegister, validateLogin } = require("./auth.validator");

async function register(req, res, next) {
  try {
    const error = validateRegister(req.body);
    if (error) return res.status(400).json({ message: error });
    const result = await authService.register(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    return res.status(201).json({
      user: result.user,
      access_token: result.accessToken,
      expires_in: "15m",
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const error = validateLogin(req.body);
    if (error) return res.status(400).json({ message: error });
    const result = await authService.login(req.body);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
    return res.json({
      user: result.user,
      access_token: result.accessToken,
      expires_in: "15m",
    });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Missing refresh token" });
    const result = await authService.refresh(token);
    return res.json({
      user: result.user,
      access_token: result.accessToken,
      expires_in: "15m",
    });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.cookies.refreshToken);
    res.clearCookie("refreshToken", refreshCookieOptions);
    return res.json({ message: "Logged out" });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh, logout };
