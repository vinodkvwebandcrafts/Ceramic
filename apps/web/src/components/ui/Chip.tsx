'use client';
import { cn } from '@/lib/cn';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, active, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'font-[family-name:var(--font-ui)] text-[0.75rem] font-medium px-4 py-[0.375rem] rounded-full border transition-all duration-150 cursor-pointer whitespace-nowrap',
        active
          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
          : 'bg-white text-[var(--color-primary-dark)] border-[var(--color-warm-gray-1)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
        className,
      )}
    >
      {children}
    </button>
  );
}
