import { Crown, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UpgradeBadgeProps {
  tier?: "starter" | "pro" | "agency" | string;
  className?: string;
  size?: "sm" | "md";
  showTooltip?: boolean;
  tooltipText?: string;
}

export function UpgradeBadge({
  tier = "pro",
  className,
  size = "sm",
  showTooltip = true,
  tooltipText,
}: UpgradeBadgeProps) {
  const navigate = useNavigate();

  const tierLabel = tier === "starter" ? "Starter" : tier === "agency" ? "Agency" : "Pro";
  const defaultTooltip = `Upgrade to ${tierLabel} to unlock this feature`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/settings", { state: { scrollToUpgrade: true } });
  };

  const badge = (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-all",
        "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400",
        "hover:from-amber-500/30 hover:to-orange-500/30 hover:scale-105",
        "border border-amber-500/30 hover:border-amber-500/50",
        "cursor-pointer shadow-sm hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-1",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      <Crown className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      <span>{tierLabel}</span>
      <Sparkles className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3", "opacity-70")} />
    </button>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-amber-500" />
          {tooltipText || defaultTooltip}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Click to view upgrade options</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface LockedFeatureOverlayProps {
  tier?: "starter" | "pro" | "agency" | string;
  children: React.ReactNode;
  className?: string;
}

export function LockedFeatureOverlay({
  tier = "pro",
  children,
  className,
}: LockedFeatureOverlayProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/settings", { state: { scrollToUpgrade: true } });
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer group",
        className
      )}
      onClick={handleClick}
    >
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-lg border-2 border-dashed border-amber-500/30 group-hover:border-amber-500/50 transition-colors">
        <div className="flex flex-col items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <UpgradeBadge tier={tier} size="md" showTooltip={false} />
        </div>
      </div>
    </div>
  );
}
