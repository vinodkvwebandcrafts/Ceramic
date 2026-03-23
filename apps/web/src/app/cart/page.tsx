import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const metadata = { title: 'Cart | Ceramic' };

export default function CartPage() {
  return (
    <section className="bg-[var(--color-cream)] py-12">
      <Container>
        <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.25rem] text-[var(--color-primary-dark)] mb-8">Your Cart</h1>
        <div className="text-center py-20">
          <p className="text-[var(--color-warm-gray-3)] text-lg mb-6">Your cart is empty</p>
          <Link href="/shop"><Button variant="primary" size="lg">Continue Shopping</Button></Link>
        </div>
      </Container>
    </section>
  );
}
