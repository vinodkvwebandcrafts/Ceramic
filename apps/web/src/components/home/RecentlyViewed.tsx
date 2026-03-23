'use client';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { mockProducts } from '@/lib/mock-data';
import { formatINRWithSymbol } from '@ceramic/utils';
import Image from 'next/image';
import Link from 'next/link';

export function RecentlyViewed() {
  // In a real app, this would use localStorage via useRecentlyViewed hook
  const recentProducts = mockProducts.slice(0, 8);

  return (
    <section className="bg-[var(--color-warm-white)] py-20">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.25rem] text-[var(--color-primary-dark)]">Recently Viewed</h2>
          <Button variant="ghost" size="sm">Clear</Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {recentProducts.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`} className="shrink-0 w-[8.75rem]">
              <div className="aspect-square rounded-[0.5rem] overflow-hidden relative bg-[var(--color-warm-gray-1)] mb-2">
                {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="140px" />}
              </div>
              <div className="font-[family-name:var(--font-heading)] text-[0.75rem] font-semibold text-[var(--color-primary-dark)] truncate">{product.name}</div>
              <div className="text-[0.6875rem] text-[var(--color-warm-gray-3)]">{formatINRWithSymbol(product.basePrice)}</div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
