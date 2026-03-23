import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const inputVariants = cva(
  'font-[family-name:var(--font-body)] font-normal border-[1.5px] border-[var(--color-warm-gray-1)] rounded-[0.1875rem] bg-white text-[var(--color-primary-dark)] outline-none px-[0.75rem] transition-colors duration-150 placeholder:text-[var(--color-warm-gray-2)] focus:border-[var(--color-primary)] w-full',
  {
    variants: {
      size: {
        sm: 'h-[1.875rem] text-[0.75rem]',
        md: 'h-[2.125rem] text-[0.8125rem]',
        lg: 'h-[2.5rem] text-[0.875rem]',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, error, label, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-[0.75rem] font-medium text-[var(--color-warm-gray-3)] mb-1 font-[family-name:var(--font-ui)]">{label}</label>}
      <input className={cn(inputVariants({ size }), error && 'border-[var(--color-secondary)]', className)} ref={ref} {...props} />
      {error && <p className="text-[0.6875rem] text-[var(--color-secondary)] mt-1">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
