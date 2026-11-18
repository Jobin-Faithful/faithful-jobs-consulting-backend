
const authService = require("./auth.service");
const {
  registerSchema,
  loginSchema
} = require("./auth.validation");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/api/v1/auth"
};

const sendAuthCookies = (res, tokens) => {
  res.cookie("accessToken", tokens.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000
  });

  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const register = async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  const user = await authService.register(validatedData);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: { user }
  });
};

const login = async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  const result = await authService.login(validatedData);

  sendAuthCookies(res, result);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: result.user }
  });
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Refresh token required"
    });
  }

  const tokens = await authService.refreshSession(token);

  sendAuthCookies(res, tokens);

  res.status(200).json({
    success: true,
    message: "Session refreshed"
  });
};

const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  await authService.logout(token);

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({
    success: true,
    message: "Logout successful"
  });
};

module.exports = {
  register,
  login,
  refresh,
  logout
};
