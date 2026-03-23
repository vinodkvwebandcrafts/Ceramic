'use client';
import { useState } from 'react';
import { cn } from '@/lib/cn';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn('divide-y divide-[var(--color-warm-gray-1)]', className)}>
      {items.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex justify-between items-center py-4 text-left font-[family-name:var(--font-heading)] font-semibold text-[0.9375rem] text-[var(--color-primary-dark)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            {item.question}
            <span className={cn('text-lg transition-transform duration-200', openIndex === index && 'rotate-45')}>+</span>
          </button>
          <div className={cn('overflow-hidden transition-all duration-300', openIndex === index ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0')}>
            <p className="text-[0.875rem] text-[var(--color-warm-gray-3)] leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
