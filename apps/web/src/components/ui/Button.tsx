import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-[family-name:var(--font-ui)] font-medium rounded-[0.1875rem] tracking-[0.02em] whitespace-nowrap transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
        secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)]',
        outline: 'bg-transparent text-[var(--color-primary)] border-[1.5px] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
        ghost: 'bg-transparent text-[var(--color-primary-dark)] border-[1.5px] border-[var(--color-warm-gray-1)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
        tint: 'bg-[var(--color-tint)] text-[var(--color-primary-dark)] hover:bg-[var(--color-warm-gray-1)]',
      },
      size: {
        sm: 'h-[1.875rem] text-[0.75rem] px-[0.875rem]',
        md: 'h-[2.125rem] text-[0.8125rem] px-[1.125rem]',
        lg: 'h-[2.5rem] text-[0.875rem] px-[1.5rem]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
  ),
);
Button.displayName = 'Button';
