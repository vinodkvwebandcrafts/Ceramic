import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="bg-[var(--color-primary-dark)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_70%_50%,rgba(25,114,120,0.3),transparent_70%)] pointer-events-none" />
      <Container className="relative z-10 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left content */}
        <div className="max-w-xl">
          <div className="font-[family-name:var(--font-ui)] text-[0.625rem] font-medium tracking-[0.12em] uppercase text-[var(--color-tint)] opacity-70 mb-[0.625rem]">
            Handcrafted with intention
          </div>
          <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] lg:text-[2.75rem] text-white leading-[1.1] mb-[0.625rem]">
            Where clay meets<br /><span className="text-[var(--color-tint)]">artistry</span>
          </h1>
          <p className="text-[0.8125rem] text-[var(--color-tint)] opacity-70 leading-[1.7] max-w-[21.25rem] mb-5">
            Each piece tells a story of craft, patience, and the beauty found in imperfection.
          </p>
          <div className="flex gap-[0.625rem]">
            <Link href="/shop"><Button variant="secondary" size="lg">Shop Collection</Button></Link>
            <Link href="/about"><Button size="lg" className="bg-transparent border-[1.5px] border-[var(--color-tint)]/30 text-[var(--color-tint)]/85 hover:border-[var(--color-tint)]/60">Our Story</Button></Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-6 pt-6 border-t border-[var(--color-tint)]/[0.12]">
            {[{ value: '2,400+', label: 'Pieces crafted' }, { value: '840+', label: 'Happy customers' }, { value: '12 yrs', label: 'Artisanship' }].map((stat) => (
              <div key={stat.label}>
                <div className="font-[family-name:var(--font-heading)] font-bold text-[1.5rem] text-[var(--color-tint)] leading-none">{stat.value}</div>
                <div className="text-[0.6875rem] text-[var(--color-tint)] opacity-50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - image grid */}
        <div className="hidden lg:grid grid-cols-2 gap-2 shrink-0">
          <div className="bg-gradient-to-br from-[#3d6b68] to-[#1e4a48] rounded-[0.625rem] h-[7.5rem] w-20 flex items-center justify-center text-[2.5rem] row-span-2">🏺</div>
          <div className="bg-gradient-to-br from-[#d4a088] to-[#b8856e] rounded-[0.625rem] h-14 w-20 flex items-center justify-center text-[1.5rem]">☕</div>
          <div className="bg-gradient-to-br from-[#c8b5a8] to-[#a8957f] rounded-[0.625rem] h-14 w-20 flex items-center justify-center text-[1.5rem]">🍵</div>
        </div>
      </Container>
    </section>
  );
}
