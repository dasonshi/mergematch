import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export function StepIndicator({ steps, currentStep, onStepClick, className }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && step.id < currentStep;

          return (
            <li key={step.id} className="relative flex-1 flex flex-col items-center">
              {/* Connector line */}
              {stepIdx !== 0 && (
                <div
                  className="absolute left-0 right-1/2 top-4 -translate-y-1/2 h-0.5 bg-muted"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted || isCurrent ? "100%" : "0%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </div>
              )}
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute left-1/2 right-0 top-4 -translate-y-1/2 h-0.5 bg-muted"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
                  />
                </div>
              )}

              {/* Step circle */}
              <motion.button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isCompleted && "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                  isClickable && "cursor-pointer"
                )}
                whileHover={isClickable ? { scale: 1.1 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  step.id
                )}
              </motion.button>

              {/* Step label */}
              <div className="mt-2 text-center">
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
