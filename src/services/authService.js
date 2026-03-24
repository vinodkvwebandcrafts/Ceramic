// src/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * @param {number} statusCode
 * @param {string} message
 */
function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function register(email, password) {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw createError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  return db.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, role: true },
  });
}

async function login(email, password) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw createError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError(401, 'Invalid credentials');

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );

  await db.user.update({ where: { id: user.id }, data: { refreshToken } });
  return { accessToken, refreshToken };
}

async function refresh(token) {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw createError(401, 'Invalid refresh token');
  }

  const user = await db.user.findFirst({ where: { id: payload.userId, refreshToken: token } });
  if (!user) throw createError(401, 'Refresh token revoked');

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );

  await db.user.update({ where: { id: user.id }, data: { refreshToken } });
  return { accessToken, refreshToken };
}

async function logout(userId) {
  await db.user.update({ where: { id: userId }, data: { refreshToken: null } });
}

module.exports = { register, login, refresh, logout };
