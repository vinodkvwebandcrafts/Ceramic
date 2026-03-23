import { cn } from '@/lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'new' | 'sale' | 'limited' | 'count';
  className?: string;
}

const variants = {
  new: 'bg-[var(--color-primary-dark)] text-white',
  sale: 'bg-[var(--color-secondary)] text-white',
  limited: 'bg-[var(--color-tint)] text-[var(--color-primary-dark)]',
  count: 'bg-[var(--color-secondary)] text-white rounded-full',
};

export function Badge({ children, variant = 'new', className }: BadgeProps) {
  return (
    <span className={cn('font-[family-name:var(--font-ui)] text-[0.5625rem] font-medium px-[0.375rem] py-[0.125rem] rounded-[0.125rem] tracking-[0.05em] uppercase', variants[variant], className)}>
      {children}
    </span>
  );
}
