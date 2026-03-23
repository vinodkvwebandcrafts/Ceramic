import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-[var(--color-warm-gray-1)] rounded-[0.5rem]', className)} />;
}
