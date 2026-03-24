// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

// Helper: generate a default variant SKU from slug
function sku(slug) {
  return slug.toUpperCase().replace(/-/g, '_').slice(0, 20) + '_DEF';
}

async function main() {
  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminPw = await bcrypt.hash('admin123', 10);
  await db.user.upsert({
    where: { email: 'admin@ceramic.com' },
    update: {},
    create: { email: 'admin@ceramic.com', passwordHash: adminPw, role: 'ADMIN' },
  });
  console.log('✓ Admin user');

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = [
    { name: 'Vases',           slug: 'vases',            description: 'Elegant ceramic vases for flowers or decor, featuring hand-thrown craftsmanship and natural glazes.' },
    { name: 'Mugs & Cups',     slug: 'mugs-and-cups',    description: 'Handcrafted mugs, tea cups, and tumblers perfect for coffee or tea lovers.' },
    { name: 'Bowls',           slug: 'bowls',             description: 'Serving and decorative bowls in earthy tones and minimalist glazes.' },
    { name: 'Plates & Dishes', slug: 'plates-and-dishes', description: 'Dinner plates, snack dishes, and platters with artisanal finishes.' },
    { name: 'Planters',        slug: 'planters',          description: 'Ceramic pots and planters suitable for indoor succulents and small plants.' },
    { name: 'Sculptures',      slug: 'sculptures',        description: 'Artistic ceramic sculptures and decorative figurines for interior decor.' },
    { name: 'Kitchenware',     slug: 'kitchenware',       description: 'Ceramic jars, containers, and utensil holders combining function with artistry.' },
    { name: 'Limited Editions', slug: 'limited-editions', description: 'Unique, small-batch ceramic pieces made by master artisans.' },
  ];

  const catMap = {};
  for (const cat of categories) {
    const record = await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    catMap[cat.slug] = record;
  }
  console.log(`✓ ${categories.length} categories`);

  // ─── Products ─────────────────────────────────────────────────────────────
  // Each entry: [categorySlug, name, slug, price, stock, description, tags[]]
  const products = [
    // Vases
    ['vases', 'Handmade Clay Vase',       'handmade-clay-vase',         49.99, 12, 'A tall, handcrafted clay vase with a rustic brown glaze.',                   ['handmade', 'glazed', 'tall']],
    ['vases', 'Blue Glaze Bud Vase',      'blue-glaze-bud-vase',        29.50, 18, 'A petite bud vase with glossy blue glaze and smooth finish.',                 ['blue', 'minimalist', 'modern']],
    ['vases', 'Rustic Terracotta Vase',   'rustic-terracotta-vase',     65.00,  8, 'Traditional terracotta vase with matte texture and natural hue.',             ['terracotta', 'earthy', 'artisan']],

    // Mugs & Cups
    ['mugs-and-cups', 'Speckled Ceramic Mug',       'speckled-ceramic-mug',        22.00, 30, 'Stoneware mug with speckled glaze and ergonomic handle.',                    ['stoneware', 'speckled', 'coffee']],
    ['mugs-and-cups', 'Minimalist White Cup Set',   'minimalist-white-cup-set',    40.00, 10, 'A pair of smooth white ceramic cups, ideal for tea.',                         ['white', 'minimal', 'tea']],
    ['mugs-and-cups', 'Rustic Handle Mug',          'rustic-handle-mug',           28.00, 15, 'Handmade clay mug with rough matte glaze and wide handle.',                   ['rustic', 'matte', 'handmade']],

    // Bowls
    ['bowls', 'Deep Stoneware Bowl',    'deep-stoneware-bowl',    32.00, 20, 'Durable serving bowl with grey finish and subtle shine.',          ['stoneware', 'durable', 'serving']],
    ['bowls', 'Ocean Glaze Bowl',       'ocean-glaze-bowl',       36.50, 12, 'A medium bowl with ocean-blue gradient glaze.',                    ['blue', 'hand-glazed', 'coastal']],
    ['bowls', 'Terracotta Salad Bowl',  'terracotta-salad-bowl',  45.00,  9, 'Large terracotta bowl, ideal for salads or display.',              ['terracotta', 'earthy', 'large']],

    // Plates & Dishes
    ['plates-and-dishes', 'Dinner Plate Set',             'dinner-plate-set',             78.00,  6, 'Set of four 10-inch plates with off-white matte glaze.',            ['tableware', 'set', 'white']],
    ['plates-and-dishes', 'Charcoal Dessert Plate',       'charcoal-dessert-plate',       24.50, 15, 'Small ceramic plate with charcoal glaze for desserts or sides.',    ['charcoal', 'small', 'modern']],
    ['plates-and-dishes', 'Hand-painted Serving Platter', 'hand-painted-serving-platter', 58.00,  5, 'Long platter with hand-painted abstract patterns.',                 ['hand-painted', 'platter', 'unique']],

    // Planters
    ['planters', 'Small Succulent Planter', 'small-succulent-planter', 18.00, 25, 'Small round planter with drainage hole, ideal for succulents.',             ['succulent', 'small', 'drainage']],
    ['planters', 'Textured White Planter',  'textured-white-planter',  34.00, 10, 'Medium-sized planter with textured surface and soft matte glaze.',           ['white', 'textured', 'indoor']],
    ['planters', 'Hanging Pot Planter',     'hanging-pot-planter',     42.00,  7, 'Ceramic hanging planter with natural fiber rope.',                           ['hanging', 'modern', 'eco']],

    // Sculptures
    ['sculptures', 'Abstract Clay Sculpture', 'abstract-clay-sculpture', 110.00, 3, 'Modern clay sculpture inspired by organic forms.',                          ['abstract', 'decor', 'modern']],
    ['sculptures', 'Minimalist Head Bust',    'minimalist-head-bust',     95.00, 4, 'Handmade bust sculpture with soft beige glaze.',                            ['bust', 'neutral', 'handmade']],
    ['sculptures', 'Terracotta Figurine',     'terracotta-figurine',      65.00, 6, 'Traditional terracotta figure symbolizing fertility and growth.',            ['terracotta', 'traditional', 'figurine']],

    // Kitchenware
    ['kitchenware', 'Ceramic Storage Jar', 'ceramic-storage-jar', 30.00, 14, 'Airtight jar with lid, ideal for spices or dry goods.',           ['storage', 'jar', 'functional']],
    ['kitchenware', 'Utensil Holder',      'utensil-holder',      26.00, 10, 'Cylindrical holder for kitchen utensils, minimalist design.',     ['kitchen', 'holder', 'utility']],
    ['kitchenware', 'Glazed Butter Dish',  'glazed-butter-dish',  35.00,  8, 'Rectangular butter dish with lid and glossy glaze.',              ['butter', 'dish', 'glazed']],

    // Limited Editions
    ['limited-editions', 'Golden Rim Vase',      'golden-rim-vase',     120.00, 2, 'Premium vase with hand-applied gold rim.',                                   ['luxury', 'gold', 'vase']],
    ['limited-editions', 'Galaxy Glaze Bowl',    'galaxy-glaze-bowl',    95.00, 3, 'Limited bowl with deep galaxy glaze and shimmering finish.',                 ['limited', 'galaxy', 'collectible']],
    ['limited-editions', "Collector's Pitcher",  'collectors-pitcher',  150.00, 1, 'One-of-a-kind ceramic pitcher made by master potter.',                       ['collector', 'artisan', 'rare']],
  ];

  let productCount = 0;
  let variantCount = 0;

  for (const [catSlug, name, slug, price, stock, description, tags] of products) {
    const product = await db.product.upsert({
      where: { slug },
      update: { name, basePrice: price, description },
      create: {
        name,
        slug,
        description,
        categoryId: catMap[catSlug].id,
        basePrice: price,
        images: [],
        status: 'ACTIVE',
      },
    });

    // Default single variant per product
    const variantSku = sku(slug);
    await db.productVariant.upsert({
      where: { sku: variantSku },
      update: { stockQty: stock, priceModifier: 0 },
      create: {
        productId: product.id,
        sku: variantSku,
        name: 'Default',
        priceModifier: 0,
        stockQty: stock,
        attributes: { tags },
      },
    });

    productCount++;
    variantCount++;
  }

  console.log(`✓ ${productCount} products, ${variantCount} variants`);
  console.log('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
