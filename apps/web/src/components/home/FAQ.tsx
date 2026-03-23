import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { mockFAQs } from '@/lib/mock-data';

export function FAQ() {
  return (
    <section className="bg-[var(--color-warm-white)] py-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar CTA */}
          <div>
            <div className="bg-white rounded-[0.75rem] border border-[var(--color-warm-gray-1)] p-6 sticky top-24">
              <h3 className="font-[family-name:var(--font-heading)] font-bold text-[1.25rem] text-[var(--color-primary-dark)] mb-2">Still have questions?</h3>
              <p className="text-[0.8125rem] text-[var(--color-warm-gray-3)] mb-4">
                We&apos;re happy to help. Reach out and our team will get back to you within 24 hours.
              </p>
              <Button variant="primary" size="md" className="w-full">Contact Us</Button>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-secondary)] mb-1">FAQ</div>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-[var(--color-primary-dark)] mb-6">Frequently Asked Questions</h2>
            <Accordion items={mockFAQs} />
          </div>
        </div>
      </Container>
    </section>
  );
}
