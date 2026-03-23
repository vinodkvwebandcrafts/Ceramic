import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import type { AuthResponse } from '@ceramic/types';

export async function register(data: { name: string; email: string; phone?: string; password: string }): Promise<AuthResponse> {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError('Email already registered');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, phone: data.phone, passwordHash },
    select: { id: true, email: true, name: true, phone: true, role: true, emailVerified: true, avatar: true },
  });

  const tokens = {
    accessToken: signAccessToken({ userId: user.id, role: user.role }),
    refreshToken: signRefreshToken({ userId: user.id, role: user.role }),
  };

  return { user, tokens };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, phone: true, role: true, emailVerified: true, avatar: true, passwordHash: true },
  });
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  const { passwordHash: _, ...userData } = user;
  const tokens = {
    accessToken: signAccessToken({ userId: user.id, role: user.role }),
    refreshToken: signRefreshToken({ userId: user.id, role: user.role }),
  };

  return { user: userData, tokens };
}

export async function refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(token);
  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, role: true } });
  if (!user) throw new UnauthorizedError('User not found');

  return {
    accessToken: signAccessToken({ userId: user.id, role: user.role }),
    refreshToken: signRefreshToken({ userId: user.id, role: user.role }),
  };
}
