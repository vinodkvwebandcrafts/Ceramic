'use client';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <section className="bg-[var(--color-warm-white)] py-20">
      <Container className="max-w-sm mx-auto">
        <div className="bg-white rounded-[0.75rem] border border-[var(--color-warm-gray-1)] p-8">
          <h1 className="font-[family-name:var(--font-heading)] font-bold text-[1.75rem] text-[var(--color-primary-dark)] mb-6 text-center">Create Account</h1>
          <form className="space-y-4">
            <Input size="lg" placeholder="Full name" label="Name" />
            <Input size="lg" type="email" placeholder="Email address" label="Email" />
            <Input size="lg" type="tel" placeholder="Phone number" label="Phone" />
            <Input size="lg" type="password" placeholder="Password" label="Password" />
            <Button variant="primary" size="lg" className="w-full">Create Account</Button>
          </form>
          <p className="text-center text-[0.8125rem] text-[var(--color-warm-gray-3)] mt-4">
            Already have an account? <Link href="/auth/login" className="text-[var(--color-primary)] font-medium">Sign in</Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
