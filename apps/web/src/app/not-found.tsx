import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <h1 className="font-[family-name:var(--font-heading)] font-bold text-[4rem] text-[var(--color-warm-gray-2)] mb-2">404</h1>
      <h2 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-[var(--color-primary-dark)] mb-4">Page Not Found</h2>
      <p className="text-[0.9375rem] text-[var(--color-warm-gray-3)] mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/"><Button variant="primary" size="lg">Back to Home</Button></Link>
    </Container>
  );
}
