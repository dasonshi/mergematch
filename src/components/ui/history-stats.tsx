import { TrendingUp, CheckCircle, RotateCcw, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistoryStatsProps {
  totalMerges: number;
  completedMerges: number;
  rollbackCount: number;
  className?: string;
}

export function HistoryStats({
  totalMerges,
  completedMerges,
  rollbackCount,
  className,
}: HistoryStatsProps) {
  const successRate = totalMerges > 0 
    ? Math.round((completedMerges / totalMerges) * 100) 
    : 0;

  const stats = [
    {
      label: "Total Merges",
      value: totalMerges,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      tooltip: "Total number of merge operations performed",
    },
    {
      label: "Completed",
      value: completedMerges,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      tooltip: "Successfully merged records",
    },
    {
      label: "Rollbacks",
      value: rollbackCount,
      icon: RotateCcw,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      tooltip: "Records that were restored after merging",
    },
    {
      label: "Success Rate",
      value: successRate,
      suffix: "%",
      icon: Percent,
      color: successRate >= 90 ? "text-green-500" : successRate >= 70 ? "text-amber-500" : "text-red-500",
      bgColor: successRate >= 90 ? "bg-green-500/10" : successRate >= 70 ? "bg-amber-500/10" : "bg-red-500/10",
      tooltip: "Percentage of merges that weren't rolled back",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-default">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {stat.label}
                        </p>
                        <div className="flex items-baseline gap-0.5">
                          <AnimatedCounter
                            value={stat.value}
                            className="text-2xl font-bold"
                          />
                          {stat.suffix && (
                            <span className="text-lg font-bold text-muted-foreground">
                              {stat.suffix}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
