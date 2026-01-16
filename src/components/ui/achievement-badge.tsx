import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, Target, Zap, Star, Award, Flame, Shield, Crown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type AchievementType =
  | 'first_merge'
  | 'merge_10'
  | 'merge_50'
  | 'merge_100'
  | 'merge_500'
  | 'rule_master'
  | 'speed_demon'
  | 'perfectionist';

interface AchievementConfig {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  glowColor: string;
}

const achievementConfigs: Record<AchievementType, AchievementConfig> = {
  first_merge: {
    icon: Star,
    label: 'First Merge',
    description: 'Completed your first merge!',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    glowColor: 'shadow-yellow-500/30',
  },
  merge_10: {
    icon: Target,
    label: 'Getting Started',
    description: 'Merged 10 duplicates',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    glowColor: 'shadow-blue-500/30',
  },
  merge_50: {
    icon: Zap,
    label: 'Momentum',
    description: 'Merged 50 duplicates',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    glowColor: 'shadow-purple-500/30',
  },
  merge_100: {
    icon: Trophy,
    label: 'Century Club',
    description: 'Merged 100 duplicates',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    glowColor: 'shadow-amber-500/30',
  },
  merge_500: {
    icon: Crown,
    label: 'Data Champion',
    description: 'Merged 500 duplicates!',
    color: 'text-orange-500',
    bgColor: 'bg-gradient-to-br from-orange-500/20 to-yellow-500/20',
    glowColor: 'shadow-orange-500/40',
  },
  rule_master: {
    icon: Shield,
    label: 'Rule Master',
    description: 'Created 5 active rules',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    glowColor: 'shadow-emerald-500/30',
  },
  speed_demon: {
    icon: Flame,
    label: 'Speed Demon',
    description: 'Merged 10 in one session',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    glowColor: 'shadow-red-500/30',
  },
  perfectionist: {
    icon: Award,
    label: 'Perfectionist',
    description: 'Zero rollbacks on 50+ merges',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    glowColor: 'shadow-sky-500/30',
  },
};

interface AchievementBadgeProps {
  type: AchievementType;
  earned?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  animate?: boolean;
}

export function AchievementBadge({
  type,
  earned = true,
  size = 'md',
  showTooltip = true,
  animate = true,
}: AchievementBadgeProps) {
  const config = achievementConfigs[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  const badge = (
    <motion.div
      initial={animate ? { scale: 0, rotate: -180 } : false}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={earned ? { scale: 1.15, rotate: 5 } : undefined}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all',
        sizeClasses[size],
        earned ? config.bgColor : 'bg-muted',
        earned && `shadow-lg ${config.glowColor}`,
        !earned && 'opacity-40 grayscale'
      )}
    >
      <Icon
        className={cn(
          iconSizes[size],
          earned ? config.color : 'text-muted-foreground'
        )}
      />
      {earned && animate && (
        <motion.div
          initial={{ scale: 1.5, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          className={cn(
            'absolute inset-0 rounded-full',
            config.bgColor
          )}
        />
      )}
    </motion.div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-center">
        <p className="font-semibold">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface AchievementRowProps {
  totalMerges: number;
  activeRules: number;
  rollbackCount?: number;
}

export function AchievementRow({
  totalMerges,
  activeRules,
  rollbackCount = 0,
}: AchievementRowProps) {
  const earnedAchievements: AchievementType[] = [];

  if (totalMerges >= 1) earnedAchievements.push('first_merge');
  if (totalMerges >= 10) earnedAchievements.push('merge_10');
  if (totalMerges >= 50) earnedAchievements.push('merge_50');
  if (totalMerges >= 100) earnedAchievements.push('merge_100');
  if (totalMerges >= 500) earnedAchievements.push('merge_500');
  if (activeRules >= 5) earnedAchievements.push('rule_master');
  if (totalMerges >= 50 && rollbackCount === 0) earnedAchievements.push('perfectionist');

  // Get the next unearned milestone
  const allMilestones: AchievementType[] = [
    'first_merge',
    'merge_10',
    'merge_50',
    'merge_100',
    'merge_500',
  ];
  const nextMilestone = allMilestones.find((m) => !earnedAchievements.includes(m));

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {earnedAchievements.map((type, index) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AchievementBadge type={type} size="sm" animate={false} />
        </motion.div>
      ))}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: earnedAchievements.length * 0.1 }}
        >
          <AchievementBadge type={nextMilestone} earned={false} size="sm" animate={false} />
        </motion.div>
      )}
    </div>
  );
}
