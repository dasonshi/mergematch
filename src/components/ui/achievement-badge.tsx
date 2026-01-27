import { cn } from '@/lib/utils';
import { TrendingUp, Target, CheckCircle, RotateCcw, Percent } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix?: string;
  color: string;
}

function StatItem({ icon: Icon, label, value, suffix, color }: StatItemProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            'bg-muted/50 hover:bg-muted transition-colors cursor-default'
          )}
        >
          <Icon className={cn('h-3.5 w-3.5', color)} />
          <span className="text-foreground tabular-nums">
            {value}{suffix}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

interface StatsRowProps {
  totalMerges: number;
  completedMerges: number;
  rollbackCount?: number;
  activeRules?: number;
}

export function StatsRow({
  totalMerges,
  completedMerges,
  rollbackCount = 0,
  activeRules = 0,
}: StatsRowProps) {
  const successRate = totalMerges > 0 
    ? Math.round(((totalMerges - rollbackCount) / totalMerges) * 100) 
    : 100;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <StatItem
        icon={TrendingUp}
        label="Total merges completed"
        value={completedMerges}
        color="text-emerald-500"
      />
      <StatItem
        icon={Target}
        label="Total duplicates processed"
        value={totalMerges}
        color="text-blue-500"
      />
      <StatItem
        icon={Percent}
        label="Success rate (no rollbacks)"
        value={successRate}
        suffix="%"
        color="text-amber-500"
      />
      {rollbackCount > 0 && (
        <StatItem
          icon={RotateCcw}
          label="Rollbacks"
          value={rollbackCount}
          color="text-red-500"
        />
      )}
      {activeRules > 0 && (
        <StatItem
          icon={CheckCircle}
          label="Active merge rules"
          value={activeRules}
          color="text-purple-500"
        />
      )}
    </div>
  );
}
