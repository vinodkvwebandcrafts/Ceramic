'use client';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Newsletter() {
  return (
    <section className="bg-[var(--color-primary-dark)] py-16">
      <Container className="text-center max-w-xl mx-auto">
        <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-tint)] opacity-70 mb-2">
          Stay Connected
        </div>
        <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-white mb-2">
          Stay in the Loop
        </h2>
        <p className="text-[0.8125rem] text-[var(--color-tint)] opacity-70 mb-6">
          Subscribe for exclusive drops, studio stories, and 10% off your first order.
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          <Input size="lg" placeholder="Enter your email" className="rounded-[1.25rem] flex-1" />
          <Button variant="secondary" size="lg" className="rounded-[1.25rem]">Subscribe</Button>
        </div>
      </Container>
    </section>
  );
}
