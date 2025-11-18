import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

export const Card = ({ children, className, padding = true, hover = false }: CardProps) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md',
        padding && 'p-4',
        hover && 'hover:shadow-lg transition-shadow cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
