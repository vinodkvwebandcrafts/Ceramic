jest.mock('../../../src/config/db');
const db = require('../../../src/config/db');
const categoryService = require('../../../src/services/categoryService');

describe('categoryService.getCategories', () => {
  it('returns all top-level categories with children', async () => {
    db.category = { findMany: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Bowls', children: [] }]) };
    const result = await categoryService.getCategories();
    expect(db.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { parentId: null } })
    );
    expect(result).toHaveLength(1);
  });
});

describe('categoryService.getCategoryBySlug', () => {
  it('returns category by slug', async () => {
    db.category = { findUnique: jest.fn().mockResolvedValue({ id: 'c1', slug: 'bowls' }) };
    const result = await categoryService.getCategoryBySlug('bowls');
    expect(result.slug).toBe('bowls');
  });

  it('throws 404 if not found', async () => {
    db.category = { findUnique: jest.fn().mockResolvedValue(null) };
    await expect(categoryService.getCategoryBySlug('missing')).rejects.toMatchObject({ statusCode: 404 });
  });
});
