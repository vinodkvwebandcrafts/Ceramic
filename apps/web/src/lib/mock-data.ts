import type { ProductListItem } from '@ceramic/types';

export const mockProducts: ProductListItem[] = [
  { id: '1', name: 'Earthy Matte Mug', slug: 'earthy-matte-mug', shortDescription: 'Wheel-thrown matte mug', categoryId: 'c1', categoryName: 'Mugs', basePrice: 59900, compareAtPrice: null, image: 'https://placehold.co/600x600/e0d0c4/283d3b?text=Mug', tags: ['new', 'bestseller'], isFeatured: true, averageRating: 4.8, reviewCount: 24, inStock: true },
  { id: '2', name: 'Teal Bud Vase', slug: 'teal-bud-vase', shortDescription: 'Elegant teal-glazed vase', categoryId: 'c2', categoryName: 'Vases', basePrice: 89900, compareAtPrice: 112400, image: 'https://placehold.co/600x600/c4d8d4/197278?text=Vase', tags: ['sale'], isFeatured: true, averageRating: 4.5, reviewCount: 18, inStock: true },
  { id: '3', name: 'Herb Planter', slug: 'herb-planter', shortDescription: 'Compact kitchen planter', categoryId: 'c3', categoryName: 'Planters', basePrice: 74900, compareAtPrice: null, image: 'https://placehold.co/600x600/e8d4c8/283d3b?text=Planter', tags: ['popular'], isFeatured: true, averageRating: 4.9, reviewCount: 31, inStock: true },
  { id: '4', name: 'Taper Candle Holder', slug: 'taper-candle-holder', shortDescription: 'Minimalist candle holder', categoryId: 'c5', categoryName: 'Decor', basePrice: 64900, compareAtPrice: null, image: 'https://placehold.co/600x600/ccd4c0/283d3b?text=Candle', tags: ['limited'], isFeatured: true, averageRating: 4.6, reviewCount: 15, inStock: true },
  { id: '5', name: 'Tea Bowl', slug: 'tea-bowl', shortDescription: 'Japanese-inspired tea bowl', categoryId: 'c1', categoryName: 'Mugs', basePrice: 44900, compareAtPrice: null, image: 'https://placehold.co/600x600/d8c4b8/283d3b?text=Bowl', tags: ['limited'], isFeatured: true, averageRating: 4.7, reviewCount: 22, inStock: true },
  { id: '6', name: 'Dinner Plate Set', slug: 'dinner-plate-set', shortDescription: 'Set of 4 hand-thrown plates', categoryId: 'c4', categoryName: 'Tableware', basePrice: 249900, compareAtPrice: null, image: 'https://placehold.co/600x600/e0d0c4/772e25?text=Plates', tags: ['bestseller'], isFeatured: true, averageRating: 4.9, reviewCount: 42, inStock: true },
  { id: '7', name: 'Pour Over Coffee Set', slug: 'pour-over-coffee-set', shortDescription: 'Handmade pour-over with mug', categoryId: 'c1', categoryName: 'Mugs', basePrice: 179900, compareAtPrice: null, image: 'https://placehold.co/600x600/d4b4a4/283d3b?text=Coffee', tags: ['bestseller'], isFeatured: true, averageRating: 4.8, reviewCount: 37, inStock: true },
  { id: '8', name: 'Floor Vase Statement', slug: 'floor-vase-statement', shortDescription: 'Large hand-coiled floor vase', categoryId: 'c2', categoryName: 'Vases', basePrice: 349900, compareAtPrice: null, image: 'https://placehold.co/600x600/8a7f78/edddd4?text=FloorVase', tags: ['premium'], isFeatured: true, averageRating: 5.0, reviewCount: 8, inStock: true },
  { id: '9', name: 'Matcha Bowl', slug: 'matcha-bowl', shortDescription: 'Traditional matcha chawan', categoryId: 'c1', categoryName: 'Mugs', basePrice: 79900, compareAtPrice: null, image: 'https://placehold.co/600x600/a8c090/283d3b?text=Matcha', tags: ['new'], isFeatured: true, averageRating: 4.7, reviewCount: 14, inStock: true },
  { id: '10', name: 'Soap Dispenser', slug: 'soap-dispenser', shortDescription: 'Ceramic with bamboo pump', categoryId: 'c5', categoryName: 'Decor', basePrice: 49900, compareAtPrice: null, image: 'https://placehold.co/600x600/c8bdb4/197278?text=Soap', tags: ['popular'], isFeatured: false, averageRating: 4.4, reviewCount: 19, inStock: true },
];

export const mockTestimonials = [
  { name: 'Ananya Patel', rating: 5, text: 'The matte mug is absolutely stunning. The weight and texture feel so intentional. It has become my favourite morning ritual companion.', verified: true },
  { name: 'Rohan Mehta', rating: 5, text: 'Ordered the dinner plate set for our anniversary. The organic edges and subtle glaze variations make every meal feel special.', verified: true },
  { name: 'Deepika Krishnan', rating: 4, text: 'Beautiful planter for my herbs. The drainage is thoughtful and the earthy tones complement my kitchen perfectly. Will order more!', verified: true },
];

export const mockFAQs = [
  { question: 'Are your ceramics food-safe?', answer: 'Yes! All our glazes are lead-free and food-safe. Our mugs, bowls, and tableware are tested and certified for daily use with food and beverages.' },
  { question: 'How should I care for my ceramics?', answer: 'Most of our pieces are dishwasher-safe, but we recommend hand washing for longevity. Avoid sudden temperature changes — don\'t pour boiling water into a cold mug. For planters, ensure proper drainage.' },
  { question: 'Do you offer free shipping?', answer: 'Yes! We offer free shipping on all orders above ₹999. For orders below ₹999, a flat rate of ₹99 applies. We ship across India within 5-7 business days.' },
  { question: 'Can I return or exchange items?', answer: 'We accept returns within 14 days of delivery for unused items in original packaging. Custom and personalized pieces are non-returnable. Contact us at hello@ceramic.store to initiate a return.' },
  { question: 'Are each piece truly unique?', answer: 'Absolutely. Every piece is handmade on the pottery wheel or hand-built. This means slight variations in shape, size, and glaze are natural and intentional — that\'s what makes each piece special.' },
  { question: 'Do you take custom orders?', answer: 'Yes, we love working on custom projects! Whether it\'s a set of mugs for your cafe or personalized gifts, reach out to us with your ideas and we\'ll discuss timelines and pricing.' },
];

export const categories = ['Mugs', 'Vases', 'Planters', 'Tableware', 'Decor'] as const;
