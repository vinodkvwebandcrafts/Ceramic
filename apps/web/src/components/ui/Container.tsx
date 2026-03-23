import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('max-w-[75rem] mx-auto px-6', className)} {...props} />;
}
