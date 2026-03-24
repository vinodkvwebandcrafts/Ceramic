jest.mock('../../../src/config/db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const db = require('../../../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../../src/services/authService');

describe('authService.register', () => {
  it('hashes password and creates user', async () => {
    db.user = { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn() };
    bcrypt.hash = jest.fn().mockResolvedValue('hashed_pw');
    db.user.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'CUSTOMER' });

    const result = await authService.register('a@b.com', 'password123');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(db.user.create).toHaveBeenCalledWith({
      data: { email: 'a@b.com', passwordHash: 'hashed_pw' },
      select: { id: true, email: true, role: true },
    });
    expect(result).toEqual({ id: 'u1', email: 'a@b.com', role: 'CUSTOMER' });
  });

  it('throws 409 if email already taken', async () => {
    db.user = { findUnique: jest.fn().mockResolvedValue({ id: 'u1' }) };
    await expect(authService.register('a@b.com', 'pw')).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already registered',
    });
  });
});

describe('authService.login', () => {
  it('returns tokens on valid credentials', async () => {
    db.user = {
      findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: 'hash', role: 'CUSTOMER' }),
      update: jest.fn(),
    };
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

    const result = await authService.login('a@b.com', 'password123');
    expect(result).toHaveProperty('accessToken', 'access_token');
    expect(result).toHaveProperty('refreshToken', 'refresh_token');
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { refreshToken: 'refresh_token' },
    });
  });

  it('throws 401 if user not found', async () => {
    db.user = { findUnique: jest.fn().mockResolvedValue(null) };
    await expect(authService.login('a@b.com', 'pw')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 401 if password wrong', async () => {
    db.user = { findUnique: jest.fn().mockResolvedValue({ passwordHash: 'hash' }) };
    bcrypt.compare = jest.fn().mockResolvedValue(false);
    await expect(authService.login('a@b.com', 'wrong')).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('authService.refresh', () => {
  it('rotates refresh token and returns new access token', async () => {
    db.user = {
      findFirst: jest.fn().mockResolvedValue({ id: 'u1', role: 'CUSTOMER', refreshToken: 'old_rt' }),
      update: jest.fn(),
    };
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1' });
    jwt.sign = jest.fn().mockReturnValueOnce('new_access').mockReturnValueOnce('new_refresh');

    const result = await authService.refresh('old_rt');
    expect(result).toHaveProperty('accessToken', 'new_access');
    expect(result).toHaveProperty('refreshToken', 'new_refresh');
  });

  it('throws 401 if refresh token not in DB', async () => {
    db.user = { findFirst: jest.fn().mockResolvedValue(null) };
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1' });
    await expect(authService.refresh('bad_token')).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('authService.logout', () => {
  it('clears refresh token from DB', async () => {
    db.user = { update: jest.fn() };
    await authService.logout('u1');
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { refreshToken: null } });
  });
});
