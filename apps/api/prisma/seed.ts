import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ceramic.store' },
    update: {},
    create: { email: 'admin@ceramic.store', name: 'Admin', passwordHash: adminHash, role: 'ADMIN', emailVerified: true },
  });

  // Test customer
  const customerHash = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: { email: 'customer@example.com', name: 'Priya Sharma', phone: '9876543210', passwordHash: customerHash, emailVerified: true },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'mugs' }, update: {}, create: { name: 'Mugs', slug: 'mugs', description: 'Handcrafted ceramic mugs for your daily ritual', image: 'https://placehold.co/400x400/e0d0c4/283d3b?text=Mugs', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'vases' }, update: {}, create: { name: 'Vases', slug: 'vases', description: 'Artisan vases to elevate your space', image: 'https://placehold.co/400x400/c4d8d4/283d3b?text=Vases', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'planters' }, update: {}, create: { name: 'Planters', slug: 'planters', description: 'Beautiful homes for your green friends', image: 'https://placehold.co/400x400/e8d4c8/283d3b?text=Planters', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'tableware' }, update: {}, create: { name: 'Tableware', slug: 'tableware', description: 'Elegant pieces for your dining table', image: 'https://placehold.co/400x400/d8c4b8/283d3b?text=Tableware', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'decor' }, update: {}, create: { name: 'Decor', slug: 'decor', description: 'Unique ceramic pieces for home decoration', image: 'https://placehold.co/400x400/ccd4c0/283d3b?text=Decor', sortOrder: 5 } }),
  ]);

  const [mugs, vases, planters, tableware, decor] = categories;

  // Products with variants and images
  const products = [
    { name: 'Earthy Matte Mug', cat: mugs.id, price: 59900, desc: 'A beautiful earthy matte finished mug, wheel-thrown and hand-glazed. Perfect for your morning coffee or evening tea.', tags: ['new', 'bestseller'], featured: true, img: 'e0d0c4/283d3b', emoji: 'Mug' },
    { name: 'Teal Bud Vase', cat: vases.id, price: 89900, compare: 112400, desc: 'Elegant teal-glazed bud vase, ideal for single stems or small arrangements. Each piece carries unique glaze variations.', tags: ['sale'], featured: true, img: 'c4d8d4/197278', emoji: 'Vase' },
    { name: 'Herb Planter', cat: planters.id, price: 74900, desc: 'Compact herb planter with drainage holes. Perfect for growing fresh herbs on your kitchen windowsill.', tags: ['popular'], featured: true, img: 'e8d4c8/283d3b', emoji: 'Planter' },
    { name: 'Taper Candle Holder', cat: decor.id, price: 64900, desc: 'Minimalist ceramic taper candle holder. Creates a warm ambiance in any room.', tags: ['limited'], featured: true, img: 'ccd4c0/283d3b', emoji: 'Candle' },
    { name: 'Tea Bowl', cat: mugs.id, price: 44900, desc: 'Traditional Japanese-inspired tea bowl. The perfect vessel for mindful tea ceremonies.', tags: ['limited'], featured: true, img: 'd8c4b8/283d3b', emoji: 'Bowl' },
    { name: 'Ribbed Planter Large', cat: planters.id, price: 129900, desc: 'Large ribbed texture planter for medium-sized indoor plants. Makes a statement in any corner.', tags: [], featured: false, img: 'b8cca8/283d3b', emoji: 'Planter' },
    { name: 'Dinner Plate Set', cat: tableware.id, price: 249900, desc: 'Set of 4 hand-thrown dinner plates with an organic edge. Each plate is unique in its own way.', tags: ['bestseller'], featured: true, img: 'e0d0c4/772e25', emoji: 'Plates' },
    { name: 'Speckled Bowl', cat: tableware.id, price: 39900, desc: 'Cereal or soup bowl with beautiful speckled glaze. Microwave and dishwasher safe.', tags: [], featured: false, img: 'c8bdb4/283d3b', emoji: 'Bowl' },
    { name: 'Wall Hanging Planter', cat: planters.id, price: 89900, desc: 'Macrame-ready wall hanging planter. Brings life to your vertical spaces.', tags: ['new'], featured: false, img: 'c4d8d4/283d3b', emoji: 'WallPlant' },
    { name: 'Incense Holder', cat: decor.id, price: 34900, desc: 'Minimalist incense holder with ash catcher. Available in multiple earth-tone glazes.', tags: [], featured: false, img: 'e8e0d8/772e25', emoji: 'Incense' },
    { name: 'Pour Over Coffee Set', cat: mugs.id, price: 179900, desc: 'Handmade pour-over dripper with matching mug. For the coffee connoisseur who appreciates craft.', tags: ['bestseller'], featured: true, img: 'd4b4a4/283d3b', emoji: 'Coffee' },
    { name: 'Cylinder Vase Tall', cat: vases.id, price: 149900, desc: 'Tall cylinder vase with reactive glaze. Perfect centerpiece for any table.', tags: [], featured: false, img: '8ab8b4/283d3b', emoji: 'TallVase' },
    { name: 'Serving Bowl Large', cat: tableware.id, price: 189900, desc: 'Large serving bowl for family gatherings. Beautiful organic shape with a glossy interior.', tags: ['popular'], featured: false, img: 'e0d0c4/c44536', emoji: 'ServBowl' },
    { name: 'Trinket Dish', cat: decor.id, price: 24900, desc: 'Small trinket dish for jewelry, keys, or small treasures. A thoughtful handmade gift.', tags: ['gift'], featured: false, img: 'edddd4/197278', emoji: 'Trinket' },
    { name: 'Espresso Cup Duo', cat: mugs.id, price: 69900, desc: 'Set of 2 espresso cups. Perfectly sized for a strong espresso or cortado.', tags: ['new'], featured: false, img: 'b89480/283d3b', emoji: 'Espresso' },
    { name: 'Floor Vase Statement', cat: vases.id, price: 349900, desc: 'Large floor vase, a true statement piece. Hand-coiled and finished with a natural matte glaze.', tags: ['premium'], featured: true, img: '8a7f78/edddd4', emoji: 'FloorVase' },
    { name: 'Butter Dish', cat: tableware.id, price: 54900, desc: 'Covered butter dish keeps your butter fresh and looks beautiful on the table.', tags: [], featured: false, img: 'f5f0eb/283d3b', emoji: 'Butter' },
    { name: 'Hanging Succulent Pot', cat: planters.id, price: 59900, desc: 'Small hanging pot for succulents. Comes with jute rope for hanging.', tags: ['gift'], featured: false, img: 'a0b090/283d3b', emoji: 'Succulent' },
    { name: 'Soap Dispenser', cat: decor.id, price: 49900, desc: 'Ceramic soap dispenser with bamboo pump. Elevates your bathroom or kitchen counter.', tags: ['popular'], featured: false, img: 'c8bdb4/197278', emoji: 'Soap' },
    { name: 'Matcha Bowl', cat: mugs.id, price: 79900, desc: 'Wide matcha bowl designed for whisking. Inspired by traditional Japanese chawan.', tags: ['new'], featured: true, img: 'a8c090/283d3b', emoji: 'Matcha' },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.desc,
        shortDescription: p.desc.substring(0, 100),
        categoryId: p.cat,
        basePrice: p.price,
        compareAtPrice: p.compare || null,
        tags: p.tags,
        isFeatured: p.featured,
        averageRating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 30) + 5,
        images: {
          create: [
            { url: `https://placehold.co/600x600/${p.img}?text=${p.emoji}`, alt: p.name, sortOrder: 0 },
            { url: `https://placehold.co/600x600/${p.img}?text=${p.emoji}+2`, alt: `${p.name} angle 2`, sortOrder: 1 },
          ],
        },
        variants: {
          create: [
            { name: 'Standard', sku: `CER-${slug.substring(0, 4).toUpperCase()}-STD`, price: p.price, stock: 15 + Math.floor(Math.random() * 20), attributes: { size: 'Standard', glaze: 'Matte' } },
            { name: 'Large', sku: `CER-${slug.substring(0, 4).toUpperCase()}-LRG`, price: Math.round(p.price * 1.3), stock: 8 + Math.floor(Math.random() * 15), attributes: { size: 'Large', glaze: 'Matte' } },
            { name: 'Glossy', sku: `CER-${slug.substring(0, 4).toUpperCase()}-GLS`, price: Math.round(p.price * 1.1), stock: 10 + Math.floor(Math.random() * 10), attributes: { size: 'Standard', glaze: 'Glossy' } },
          ],
        },
      },
    });
  }

  // Sample reviews
  const allProducts = await prisma.product.findMany({ take: 10 });
  for (const product of allProducts) {
    await prisma.review.upsert({
      where: { productId_userId: { productId: product.id, userId: customer.id } },
      update: {},
      create: {
        productId: product.id,
        userId: customer.id,
        rating: 4 + Math.floor(Math.random() * 2),
        title: 'Beautiful craftsmanship',
        body: 'Absolutely love this piece. The quality is outstanding and it looks even better in person. The glaze has beautiful variations that make it truly unique.',
        isVerified: true,
        isApproved: true,
      },
    });
  }

  // Customer address
  await prisma.address.upsert({
    where: { id: 'seed-address' },
    update: {},
    create: {
      id: 'seed-address',
      userId: customer.id,
      label: 'Home',
      fullName: 'Priya Sharma',
      phone: '9876543210',
      line1: '42, MG Road, Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560038',
      isDefault: true,
    },
  });

  console.log('Seed complete!');
  console.log(`Admin: admin@ceramic.store / Admin123!`);
  console.log(`Customer: customer@example.com / Customer123!`);
  console.log(`Products: ${products.length} created with variants`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
