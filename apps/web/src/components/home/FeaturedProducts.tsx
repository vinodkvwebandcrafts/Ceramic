'use client';
import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ProductCard } from '@/components/product/ProductCard';
import { mockProducts, categories } from '@/lib/mock-data';
import Link from 'next/link';

export function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const featured = mockProducts.filter((p) => p.isFeatured);
  const filtered = activeCategory === 'All' ? featured : featured.filter((p) => p.categoryName === activeCategory);

  return (
    <section className="bg-[var(--color-cream)] py-20">
      <Container>
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-secondary)] mb-1">Curated Collection</div>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-[var(--color-primary-dark)]">Featured Products</h2>
          </div>
          <Link href="/shop"><Button variant="outline" size="md">View All</Button></Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          <Chip active={activeCategory === 'All'} onClick={() => setActiveCategory('All')}>All</Chip>
          {categories.map((cat) => (
            <Chip key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>{cat}</Chip>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-[0.875rem]">
          {filtered.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
