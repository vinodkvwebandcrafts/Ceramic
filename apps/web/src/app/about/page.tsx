import { Container } from '@/components/ui/Container';

export const metadata = { title: 'About | Ceramic' };

export default function AboutPage() {
  return (
    <section className="bg-[var(--color-cream)] py-20">
      <Container className="max-w-3xl">
        <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-secondary)] mb-2">Our Story</div>
        <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] text-[var(--color-primary-dark)] mb-6">Where Clay Meets Artistry</h1>
        <div className="space-y-6 text-[0.9375rem] text-[var(--color-warm-gray-3)] leading-relaxed">
          <p>Ceramic was born in 2014 in a small studio in Indiranagar, Bangalore. What started as a weekend hobby for two friends quickly grew into a passion-driven craft studio dedicated to making beautiful, functional ceramics for everyday life.</p>
          <p>Every piece in our collection is wheel-thrown or hand-built by our team of skilled artisans. We source our clay locally and develop our glazes in-house, ensuring each batch meets our standards for both beauty and durability.</p>
          <p>We believe that the objects you use every day should carry the warmth of human touch. A handmade mug holds your coffee differently than a factory-made one — and that difference matters.</p>
          <p>Today, with over 2,400 pieces crafted and 840 happy customers, we continue to push the boundaries of what handmade ceramics can be. From our studio to your home, each piece carries a story of craft, patience, and the beauty found in imperfection.</p>
        </div>
      </Container>
    </section>
  );
}
