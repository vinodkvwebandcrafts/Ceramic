jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../../src/middleware/auth');

describe('verifyToken middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('calls next with req.user set when token is valid', () => {
    req.headers.authorization = 'Bearer valid_token';
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1', role: 'CUSTOMER' });
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ userId: 'u1', role: 'CUSTOMER' });
  });

  it('returns 401 when no authorization header', () => {
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalledWith();
  });

  it('returns 401 when token is invalid', () => {
    req.headers.authorization = 'Bearer bad_token';
    jwt.verify = jest.fn().mockImplementation(() => { throw new Error('invalid'); });
    verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
