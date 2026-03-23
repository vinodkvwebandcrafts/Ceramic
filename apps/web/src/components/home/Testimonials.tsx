import { Container } from '@/components/ui/Container';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { mockTestimonials } from '@/lib/mock-data';

export function Testimonials() {
  return (
    <section className="bg-[var(--color-cream)] py-20">
      <Container>
        <div className="text-center mb-10">
          <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-secondary)] mb-1">What People Say</div>
          <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-[var(--color-primary-dark)]">Customer Stories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTestimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-[0.75rem] border border-[var(--color-warm-gray-1)] p-6">
              <StarRating rating={t.rating} size="md" />
              <p className="text-[0.875rem] text-[var(--color-warm-gray-3)] leading-relaxed mt-3 mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white font-[family-name:var(--font-heading)] font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-[family-name:var(--font-heading)] font-semibold text-[0.8125rem] text-[var(--color-primary-dark)]">{t.name}</div>
                  {t.verified && <Badge variant="new" className="text-[0.5rem] bg-green-100 text-green-700">Verified Purchase</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
