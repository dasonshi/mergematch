import { useAnimatedCounter } from '@/hooks/use-animated-counter';
import { motion } from 'framer-motion';
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
    <motion.span
      key={value}
      initial={{ scale: 1.1, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('tabular-nums', className)}
    >
      {formatFn(displayValue)}
    </motion.span>
  );
}
