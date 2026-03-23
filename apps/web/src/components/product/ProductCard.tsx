import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { formatINRWithSymbol } from '@ceramic/utils';
import type { ProductListItem } from '@ceramic/types';

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const badgeTag = product.tags[0];

  return (
    <Link href={`/shop/${product.slug}`} className="group block bg-white border border-[var(--color-warm-gray-1)] rounded-[0.75rem] overflow-hidden cursor-pointer transition-all duration-200 hover:border-[var(--color-warm-gray-2)] hover:-translate-y-[0.125rem] hover:shadow-md">
      {/* Image */}
      <div className="aspect-square relative flex items-center justify-center bg-[var(--color-warm-white)]">
        {product.image && (
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
        )}
        {badgeTag && (
          <div className="absolute top-[0.4375rem] left-[0.4375rem]">
            <Badge variant={badgeTag === 'sale' ? 'sale' : badgeTag === 'limited' ? 'limited' : 'new'}>
              {badgeTag === 'sale' && product.compareAtPrice ? `-${Math.round((1 - product.basePrice / product.compareAtPrice) * 100)}%` : badgeTag === 'limited' ? 'Ltd' : 'New'}
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-[0.625rem_0.75rem_0.75rem]">
        <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.07em] uppercase text-[var(--color-warm-gray-3)] mb-[0.1875rem]">
          {product.categoryName}
        </div>
        <div className="font-[family-name:var(--font-heading)] text-[0.8125rem] font-semibold text-[var(--color-primary-dark)] mb-1 truncate leading-tight">
          {product.name}
        </div>
        <StarRating rating={product.averageRating} />
        <div className="flex items-center justify-between mt-[0.3125rem]">
          <span className="font-[family-name:var(--font-heading)] text-[0.875rem] font-bold text-[var(--color-primary-dark)]">
            {formatINRWithSymbol(product.basePrice)}
          </span>
          <button
            className="w-[1.625rem] h-[1.625rem] rounded-[0.1875rem] bg-[var(--color-primary)] text-white text-[1rem] flex items-center justify-center hover:bg-[var(--color-primary-dark)] transition-colors cursor-pointer"
            aria-label={`Add ${product.name} to cart`}
            onClick={(e) => { e.preventDefault(); }}
          >
            +
          </button>
        </div>
      </div>
    </Link>
  );
}
