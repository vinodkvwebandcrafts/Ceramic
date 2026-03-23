import { Container } from '@/components/ui/Container';
import { categories } from '@/lib/mock-data';
import Link from 'next/link';

export const metadata = { title: 'Collections | Ceramic' };

export default function CollectionsPage() {
  return (
    <section className="bg-[var(--color-cream)] py-12">
      <Container>
        <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] text-[var(--color-primary-dark)] mb-8">Collections</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link key={cat} href={`/collections/${cat.toLowerCase()}`} className="bg-white rounded-[0.75rem] border border-[var(--color-warm-gray-1)] p-8 text-center hover:border-[var(--color-primary)] hover:shadow-md transition-all">
              <div className="text-3xl mb-3">{cat === 'Mugs' ? '☕' : cat === 'Vases' ? '🏺' : cat === 'Planters' ? '🌱' : cat === 'Tableware' ? '🍽️' : '🕯️'}</div>
              <h2 className="font-[family-name:var(--font-heading)] font-semibold text-[1rem] text-[var(--color-primary-dark)]">{cat}</h2>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
