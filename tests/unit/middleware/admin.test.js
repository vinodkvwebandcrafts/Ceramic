const { requireAdmin } = require('../../../src/middleware/admin');

describe('requireAdmin middleware', () => {
  let req, res, next;
  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('calls next() when user role is ADMIN', () => {
    req = { user: { role: 'ADMIN' } };
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user role is CUSTOMER', () => {
    req = { user: { role: 'CUSTOMER' } };
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalledWith();
  });

  it('returns 403 when req.user is undefined', () => {
    req = {};
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
