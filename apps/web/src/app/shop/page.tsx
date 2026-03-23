import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/product/ProductCard';
import { mockProducts } from '@/lib/mock-data';

export const metadata = { title: 'Shop | Ceramic' };

export default function ShopPage() {
  return (
    <section className="bg-[var(--color-cream)] py-12">
      <Container>
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] text-[var(--color-primary-dark)]">Shop All</h1>
          <p className="text-[0.9375rem] text-[var(--color-warm-gray-3)] mt-1">Discover our full collection of handcrafted ceramics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[0.875rem]">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
