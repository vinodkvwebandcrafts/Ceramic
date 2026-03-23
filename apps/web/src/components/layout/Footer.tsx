import Link from 'next/link';
import { Container } from '@/components/ui/Container';

const quickLinks = [
  { href: '/shop', label: 'Shop All' },
  { href: '/collections/mugs', label: 'Mugs' },
  { href: '/collections/vases', label: 'Vases' },
  { href: '/collections/planters', label: 'Planters' },
  { href: '/collections/tableware', label: 'Tableware' },
];

const serviceLinks = [
  { href: '/about', label: 'About Us' },
  { href: '#', label: 'Shipping & Returns' },
  { href: '#', label: 'Care Guide' },
  { href: '#', label: 'FAQ' },
  { href: '#', label: 'Contact' },
];

export function Footer() {
  return (
    <footer className="bg-[#1a1614] py-14">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="font-[family-name:var(--font-logo)] text-[1.375rem] text-white mb-3">
              Cer<span className="text-[var(--color-secondary)]">a</span>mic
            </div>
            <p className="text-white/50 text-[0.8125rem] leading-relaxed">
              Handcrafted ceramics made with intention. Each piece tells a story of craft, patience, and artistry.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-semibold text-white/80 text-[0.875rem] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 text-[0.8125rem] hover:text-white/80 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-semibold text-white/80 text-[0.875rem] mb-4">Customer Service</h4>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/50 text-[0.8125rem] hover:text-white/80 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] font-semibold text-white/80 text-[0.875rem] mb-4">Get in Touch</h4>
            <div className="space-y-2 text-white/50 text-[0.8125rem]">
              <p>hello@ceramic.store</p>
              <p>+91 98765 43210</p>
              <p>Indiranagar, Bangalore</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-[0.75rem]">&copy; 2026 Ceramic. All rights reserved.</p>
          <div className="flex gap-3 text-white/30 text-[0.6875rem] font-[family-name:var(--font-ui)]">
            <span>Visa</span><span>Mastercard</span><span>UPI</span><span>Razorpay</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
