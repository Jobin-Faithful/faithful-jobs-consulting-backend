
const User = require("../users/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const env = require("../../config/env");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
      issuer: "faithful-jobs-consulting",
      audience: "faithful-jobs-api"
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      jti: crypto.randomUUID()
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
      issuer: "faithful-jobs-consulting",
      audience: "faithful-jobs-api"
    }
  );
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);

  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
};

const refreshSession = async (refreshToken) => {
  let payload;

  try {
    payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET,
      {
        issuer: "faithful-jobs-consulting",
        audience: "faithful-jobs-api"
      }
    );
  } catch {
    const error = new Error("Invalid or expired refresh token");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(payload.sub)
    .select("+refreshTokenHash");

  if (
    !user ||
    !user.isActive ||
    !user.refreshTokenHash ||
    user.refreshTokenHash !== hashToken(refreshToken)
  ) {
    const error = new Error("Refresh session is no longer valid");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokenHash = hashToken(newRefreshToken);

  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;

  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET,
      {
        issuer: "faithful-jobs-consulting",
        audience: "faithful-jobs-api"
      }
    );

    await User.findOneAndUpdate(
      {
        _id: payload.sub,
        refreshTokenHash: hashToken(refreshToken)
      },
      {
        $unset: { refreshTokenHash: 1 }
      }
    );
  } catch {
    // Invalid or expired tokens cannot be used to maintain a session.
  }
};

module.exports = {
  register,
  login,
  refreshSession,
  logout
};
