import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { categories } from '@/lib/mock-data';

export function CategoryStrip() {
  return (
    <section className="bg-[var(--color-warm-white)] py-6">
      <Container>
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/collections/${cat.toLowerCase()}`}
              className="font-[family-name:var(--font-ui)] text-[0.75rem] font-medium px-4 py-[0.375rem] rounded-full border border-[var(--color-warm-gray-1)] bg-white text-[var(--color-primary-dark)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
