// Manual mock for Prisma client singleton
// Jest cannot auto-mock PrismaClient, so we return a plain object
// Tests assign mock methods directly: db.user = { findUnique: jest.fn() }
module.exports = {};
