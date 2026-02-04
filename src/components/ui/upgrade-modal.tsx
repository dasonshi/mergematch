import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Sparkles, X, Zap, Building2, Users, Calendar, Merge, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";

export type FeatureKey =
  | "merge_strategies"
  | "custom_fields"
  | "custom_strategy"
  | "custom_logic"
  | "custom_objects"
  | "company_matching"
  | "opportunities_matching"
  | "scheduled_scans"
  | "auto_merge"
  | "white_label"
  | "unlimited_merges"
  | "field_preservation";

interface PlanConfig {
  name: string;
  price: string;
  description: string;
  tier: "free" | "starter" | "pro" | "agency";
  features: {
    key: FeatureKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    included: boolean;
  }[];
  popular?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic matching",
    tier: "free",
    features: [
      { key: "merge_strategies", label: "Basic merge strategies", icon: Merge, included: true },
      { key: "custom_fields", label: "Custom field matching", icon: Zap, included: false },
      { key: "custom_strategy", label: "Custom merge strategies", icon: Merge, included: false },
      { key: "custom_objects", label: "Custom objects", icon: Building2, included: false },
      { key: "scheduled_scans", label: "Scheduled scans", icon: Calendar, included: false },
      { key: "auto_merge", label: "Auto-merge", icon: Sparkles, included: false },
    ],
  },
  {
    name: "Starter",
    price: "$19",
    description: "For growing teams",
    tier: "starter",
    features: [
      { key: "merge_strategies", label: "Advanced merge strategies", icon: Merge, included: true },
      { key: "custom_fields", label: "Custom field matching", icon: Zap, included: true },
      { key: "custom_strategy", label: "Custom merge strategies", icon: Merge, included: false },
      { key: "custom_objects", label: "Custom objects", icon: Building2, included: false },
      { key: "scheduled_scans", label: "Scheduled scans", icon: Calendar, included: false },
      { key: "auto_merge", label: "Auto-merge", icon: Sparkles, included: false },
    ],
  },
  {
    name: "Pro",
    price: "$29",
    description: "Full automation power",
    tier: "pro",
    popular: true,
    features: [
      { key: "merge_strategies", label: "Advanced merge strategies", icon: Merge, included: true },
      { key: "custom_fields", label: "Custom field matching", icon: Zap, included: true },
      { key: "custom_strategy", label: "Custom merge strategies", icon: Merge, included: true },
      { key: "custom_objects", label: "Custom objects", icon: Building2, included: true },
      { key: "scheduled_scans", label: "Scheduled scans", icon: Calendar, included: true },
      { key: "auto_merge", label: "Auto-merge", icon: Sparkles, included: true },
    ],
  },
  {
    name: "Agency",
    price: "$49",
    description: "For agencies & enterprises",
    tier: "agency",
    features: [
      { key: "merge_strategies", label: "Advanced merge strategies", icon: Merge, included: true },
      { key: "custom_fields", label: "Custom field matching", icon: Zap, included: true },
      { key: "custom_strategy", label: "Custom merge strategies", icon: Merge, included: true },
      { key: "custom_objects", label: "Custom objects", icon: Building2, included: true },
      { key: "scheduled_scans", label: "Scheduled scans", icon: Calendar, included: true },
      { key: "auto_merge", label: "Auto-merge + White label", icon: Sparkles, included: true },
    ],
  },
];

// Map feature keys to the minimum tier required
const FEATURE_TIER_MAP: Record<FeatureKey, "free" | "starter" | "pro" | "agency"> = {
  merge_strategies: "starter",
  custom_fields: "starter",
  custom_strategy: "pro",
  custom_logic: "pro",
  custom_objects: "pro",
  company_matching: "starter",
  opportunities_matching: "pro",
  scheduled_scans: "pro",
  auto_merge: "pro",
  white_label: "agency",
  unlimited_merges: "starter",
  field_preservation: "pro",
};

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightFeature?: FeatureKey;
}

export function UpgradeModal({ open, onOpenChange, highlightFeature }: UpgradeModalProps) {
  const { plan: currentPlan, upgradeUrl } = useLocation();
  
  // Find which plan tier includes the highlighted feature
  const recommendedTier = highlightFeature ? FEATURE_TIER_MAP[highlightFeature] : null;
  
  const handleUpgrade = (tier: string) => {
    if (upgradeUrl) {
      window.open(upgradeUrl, "_blank", "noopener,noreferrer");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary/10 via-background to-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-500" />
                Upgrade Your Plan
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {highlightFeature 
                  ? "Unlock this feature and supercharge your workflow"
                  : "Choose the plan that fits your needs"}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              Current: {currentPlan}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2">
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {PLANS.map((planConfig, index) => {
                const isCurrentPlan = planConfig.tier === currentPlan;
                const isRecommended = planConfig.tier === recommendedTier;
                const tierOrder = ["free", "starter", "pro", "agency"];
                const isUpgrade = tierOrder.indexOf(planConfig.tier) > tierOrder.indexOf(currentPlan);

                return (
                  <motion.div
                    key={planConfig.tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative rounded-xl border-2 p-4 transition-all duration-300",
                      isRecommended 
                        ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/20 scale-[1.02]" 
                        : isCurrentPlan
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-muted-foreground/50",
                      planConfig.popular && !isRecommended && "border-primary"
                    )}
                  >
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                      >
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      </motion.div>
                    )}

                    {/* Popular Badge */}
                    {planConfig.popular && !isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="default">Most Popular</Badge>
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge variant="secondary">Current Plan</Badge>
                      </div>
                    )}

                    <div className="pt-2 space-y-4">
                      {/* Plan Header */}
                      <div className="text-center space-y-1">
                        <h3 className="font-bold text-lg">{planConfig.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold">{planConfig.price}</span>
                          <span className="text-muted-foreground text-sm">/mo</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{planConfig.description}</p>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2">
                        {planConfig.features.map((feature) => {
                          const isHighlighted = feature.key === highlightFeature;
                          const Icon = feature.icon;
                          
                          return (
                            <motion.li
                              key={feature.key}
                              className={cn(
                                "flex items-center gap-2 text-sm py-1 px-2 rounded-md transition-colors",
                                isHighlighted && feature.included && "bg-amber-500/20 ring-1 ring-amber-500/50",
                                !feature.included && "opacity-50"
                              )}
                              animate={isHighlighted && feature.included ? { 
                                scale: [1, 1.02, 1],
                              } : {}}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              {feature.included ? (
                                <Check className={cn(
                                  "h-4 w-4 shrink-0",
                                  isHighlighted ? "text-amber-500" : "text-green-500"
                                )} />
                              ) : (
                                <X className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className={cn(
                                isHighlighted && feature.included && "font-medium text-amber-700 dark:text-amber-300"
                              )}>
                                {feature.label}
                              </span>
                              {isHighlighted && feature.included && (
                                <Sparkles className="h-3 w-3 text-amber-500 ml-auto" />
                              )}
                            </motion.li>
                          );
                        })}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        className={cn(
                          "w-full",
                          isRecommended && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        )}
                        variant={isCurrentPlan ? "outline" : isRecommended ? "default" : "secondary"}
                        disabled={isCurrentPlan || !isUpgrade}
                        onClick={() => handleUpgrade(planConfig.tier)}
                      >
                        {isCurrentPlan ? (
                          "Current Plan"
                        ) : !isUpgrade ? (
                          "—"
                        ) : isRecommended ? (
                          <>
                            <Zap className="h-4 w-4 mr-1" />
                            Upgrade Now
                          </>
                        ) : (
                          "Select Plan"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            All plans include 14-day free trial. Cancel anytime. Prices in USD.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Context for managing the upgrade modal globally
import { createContext, useContext } from "react";

interface UpgradeModalContextType {
  openUpgradeModal: (feature?: FeatureKey) => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType>({
  openUpgradeModal: () => {},
});

export function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [highlightFeature, setHighlightFeature] = useState<FeatureKey | undefined>();

  const openUpgradeModal = (feature?: FeatureKey) => {
    setHighlightFeature(feature);
    setOpen(true);
  };

  return (
    <UpgradeModalContext.Provider value={{ openUpgradeModal }}>
      {children}
      <UpgradeModal 
        open={open} 
        onOpenChange={setOpen} 
        highlightFeature={highlightFeature}
      />
    </UpgradeModalContext.Provider>
  );
}

export function useUpgradeModal() {
  return useContext(UpgradeModalContext);
}
