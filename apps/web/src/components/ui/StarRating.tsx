interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const fontSize = size === 'sm' ? 'text-[0.625rem]' : 'text-[0.875rem]';
  return (
    <div className={`${fontSize} text-[#e8a93c]`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </div>
  );
}
