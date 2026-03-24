jest.mock('../../src/config/db');
jest.mock('../../src/config/stripe');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('POST /api/auth/register', () => {
  it('returns 201 with user on success', async () => {
    db.user = {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com', role: 'CUSTOMER' }),
    };
    bcrypt.hash = jest.fn().mockResolvedValue('hashed_pw');

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('test@test.com');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('returns 409 if email already registered', async () => {
    db.user = { findUnique: jest.fn().mockResolvedValue({ id: 'u1' }) };

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'taken@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('returns 400 for password too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'short' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 200 with tokens on valid credentials', async () => {
    db.user = {
      findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'test@test.com', passwordHash: 'hash', role: 'CUSTOMER' }),
      update: jest.fn(),
    };
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    jwt.sign = jest.fn().mockReturnValueOnce('access_tok').mockReturnValueOnce('refresh_tok');

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken', 'access_tok');
    expect(res.body).toHaveProperty('refreshToken', 'refresh_tok');
  });

  it('returns 401 for wrong password', async () => {
    db.user = {
      findUnique: jest.fn().mockResolvedValue({ id: 'u1', passwordHash: 'hash' }),
    };
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    db.user = { findUnique: jest.fn().mockResolvedValue(null) };

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns new tokens on valid refresh token', async () => {
    db.user = {
      findFirst: jest.fn().mockResolvedValue({ id: 'u1', role: 'CUSTOMER' }),
      update: jest.fn(),
    };
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1' });
    jwt.sign = jest.fn().mockReturnValueOnce('new_access').mockReturnValueOnce('new_refresh');

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'valid_refresh' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken', 'new_access');
  });

  it('returns 401 for revoked token', async () => {
    db.user = { findFirst: jest.fn().mockResolvedValue(null) };
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'revoked_token' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 when authenticated', async () => {
    db.user = { update: jest.fn() };
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1', role: 'CUSTOMER' });

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});
