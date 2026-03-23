import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { mockProducts } from '@/lib/mock-data';
import { formatINRWithSymbol } from '@ceramic/utils';

export function BestSellers() {
  const bestsellers = mockProducts.filter((p) => p.tags.includes('bestseller') || p.averageRating >= 4.7).slice(0, 6);
  const featured = bestsellers[0];
  const ranked = bestsellers.slice(1, 6);

  return (
    <section className="bg-[var(--color-warm-white)] py-20">
      <Container>
        <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-secondary)] mb-1">Top Picks</div>
        <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-[var(--color-primary-dark)] mb-8">Best Sellers</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured large card */}
          {featured && (
            <Link href={`/shop/${featured.slug}`} className="block bg-white rounded-[0.75rem] border border-[var(--color-warm-gray-1)] overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-[var(--color-warm-white)]">
                {featured.image && <Image src={featured.image} alt={featured.name} fill className="object-cover" sizes="50vw" />}
              </div>
              <div className="p-5">
                <h3 className="font-[family-name:var(--font-heading)] font-bold text-[1.25rem] text-[var(--color-primary-dark)] mb-1">{featured.name}</h3>
                <StarRating rating={featured.averageRating} size="md" />
                <div className="flex items-center justify-between mt-3">
                  <span className="font-[family-name:var(--font-heading)] font-bold text-[1.25rem]">{formatINRWithSymbol(featured.basePrice)}</span>
                  <Button variant="primary" size="md">Shop Now</Button>
                </div>
              </div>
            </Link>
          )}

          {/* Ranked list */}
          <div className="space-y-3">
            {ranked.map((product, i) => (
              <Link key={product.id} href={`/shop/${product.slug}`} className="flex items-center gap-4 bg-white rounded-[0.75rem] border border-[var(--color-warm-gray-1)] p-3 hover:border-[var(--color-primary)] transition-colors">
                <span className="font-[family-name:var(--font-heading)] font-bold text-[1.5rem] text-[var(--color-warm-gray-2)] w-8 text-center shrink-0">{i + 1}</span>
                <div className="w-14 h-14 rounded-[0.5rem] relative overflow-hidden bg-[var(--color-warm-white)] shrink-0">
                  {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-[family-name:var(--font-heading)] font-semibold text-[0.8125rem] text-[var(--color-primary-dark)] truncate">{product.name}</div>
                  <StarRating rating={product.averageRating} />
                </div>
                <span className="font-[family-name:var(--font-heading)] font-bold text-[0.875rem] shrink-0">{formatINRWithSymbol(product.basePrice)}</span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
