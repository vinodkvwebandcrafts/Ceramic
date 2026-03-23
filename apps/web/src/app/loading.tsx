import { Skeleton } from '@/components/ui/Skeleton';
import { Container } from '@/components/ui/Container';

export default function Loading() {
  return (
    <Container className="py-20">
      <Skeleton className="h-[400px] w-full mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-square w-full mb-3" />
            <Skeleton className="h-3 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </Container>
  );
}
