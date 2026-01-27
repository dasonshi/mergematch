import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  className,
  formatFn = (v) => v.toLocaleString(),
}: AnimatedCounterProps) {
  const displayValue = useAnimatedCounter(value, duration);

  return (
    <span className={cn('tabular-nums', className)}>
      {formatFn(displayValue)}
    </span>
  );
}
