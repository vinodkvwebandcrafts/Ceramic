import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { mockProducts } from '@/lib/mock-data';
import { formatINRWithSymbol } from '@ceramic/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);
  return { title: product ? `${product.name} | Ceramic` : 'Product | Ceramic' };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <section className="bg-[var(--color-cream)] py-12">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square relative rounded-[0.75rem] overflow-hidden bg-[var(--color-warm-white)]">
            {product.image && <Image src={product.image} alt={product.name} fill className="object-cover" sizes="50vw" priority />}
          </div>

          {/* Info */}
          <div className="py-4">
            <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.07em] uppercase text-[var(--color-warm-gray-3)] mb-2">{product.categoryName}</div>
            <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] text-[var(--color-primary-dark)] mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={product.averageRating} size="md" />
              <span className="text-[0.8125rem] text-[var(--color-warm-gray-3)]">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="font-[family-name:var(--font-heading)] font-bold text-[1.5rem]">{formatINRWithSymbol(product.basePrice)}</span>
              {product.compareAtPrice && (
                <span className="text-[var(--color-warm-gray-3)] line-through text-[0.875rem]">{formatINRWithSymbol(product.compareAtPrice)}</span>
              )}
            </div>

            <p className="text-[0.9375rem] text-[var(--color-warm-gray-3)] leading-relaxed mb-8">{product.shortDescription}</p>

            <div className="flex gap-3 mb-6">
              <Button variant="primary" size="lg" className="flex-1">Add to Cart</Button>
              <Button variant="ghost" size="lg">♡</Button>
            </div>

            <div className="text-[0.75rem] text-[var(--color-warm-gray-3)] space-y-1">
              <p>Free shipping on orders above ₹999</p>
              <p>Handcrafted to order — ships within 5-7 days</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
