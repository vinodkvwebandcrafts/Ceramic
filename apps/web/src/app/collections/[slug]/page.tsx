import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { mockProducts } from '@/lib/mock-data';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return { title: `${name} | Ceramic` };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  const products = mockProducts.filter((p) => p.categoryName.toLowerCase() === slug);

  return (
    <section className="bg-[var(--color-cream)] py-12">
      <Container>
        <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] text-[var(--color-primary-dark)] mb-2">{name}</h1>
        <p className="text-[0.9375rem] text-[var(--color-warm-gray-3)] mb-8">Browse our handcrafted {name.toLowerCase()} collection</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[0.875rem]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center py-20 text-[var(--color-warm-gray-3)]">No products found in this collection.</p>
        )}
      </Container>
    </section>
  );
}
