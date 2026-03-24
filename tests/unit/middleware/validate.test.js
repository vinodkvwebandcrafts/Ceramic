const Joi = require('joi');
const validate = require('../../../src/middleware/validate');

describe('validate middleware', () => {
  const schema = Joi.object({ name: Joi.string().required() });
  let res, next;

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('calls next() when body is valid', () => {
    const req = { body: { name: 'Alice' } };
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with details array when validation fails', () => {
    const req = { body: {} };
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Validation failed', details: expect.any(Array) })
    );
    expect(next).not.toHaveBeenCalledWith();
  });
});
