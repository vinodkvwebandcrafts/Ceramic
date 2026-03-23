import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const values = [
  { icon: '🤲', title: 'Handcrafted', desc: 'Every piece made by hand' },
  { icon: '🌿', title: 'Sustainable', desc: 'Eco-friendly materials' },
  { icon: '🏛️', title: 'Traditional', desc: 'Time-honored techniques' },
  { icon: '✨', title: 'Premium', desc: 'Gallery-quality finish' },
];

export function AboutBrand() {
  return (
    <section className="bg-[var(--color-cream)] py-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Photo mosaic */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-[#c8b5a8] to-[#a8957f] rounded-[0.75rem] h-48 flex items-center justify-center text-4xl">🏺</div>
            <div className="bg-gradient-to-br from-[#d4a088] to-[#b8856e] rounded-[0.75rem] h-32 flex items-center justify-center text-3xl">🤲</div>
            <div className="bg-gradient-to-br from-[#3d6b68] to-[#1e4a48] rounded-[0.75rem] h-32 flex items-center justify-center text-3xl">☕</div>
            <div className="bg-gradient-to-br from-[#e0d0c4] to-[#c4aa99] rounded-[0.75rem] h-48 flex items-center justify-center text-4xl">🍵</div>
          </div>

          {/* Content */}
          <div>
            <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-secondary)] mb-2">Our Story</div>
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-[var(--color-primary-dark)] mb-4">Crafted with Purpose</h2>
            <p className="text-[0.9375rem] text-[var(--color-warm-gray-3)] leading-relaxed mb-8">
              Founded in a small Bangalore studio, Ceramic began as a passion project between two potters who believed everyday objects should carry the warmth of human touch. Twelve years later, we continue to wheel-throw, hand-glaze, and kiln-fire every piece with the same care.
            </p>

            {/* Values grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {values.map((v) => (
                <div key={v.title} className="flex items-start gap-3">
                  <span className="text-xl">{v.icon}</span>
                  <div>
                    <div className="font-[family-name:var(--font-heading)] font-semibold text-[0.8125rem] text-[var(--color-primary-dark)]">{v.title}</div>
                    <div className="text-[0.75rem] text-[var(--color-warm-gray-3)]">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link href="/about"><Button variant="primary" size="lg">Learn More</Button></Link>
              <Link href="/shop"><Button variant="outline" size="lg">Shop All</Button></Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
