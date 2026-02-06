import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LocationProvider } from "@/contexts/LocationContext";
import { UpgradeModalProvider } from "@/components/ui/upgrade-modal";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import MatchRuleDetail from "./pages/MatchRuleDetail";
import MatchRuleForm from "./pages/MatchRuleForm";
import MatchReview from "./pages/MatchReview";
import MergeStrategies from "./pages/MergeStrategies";
import MergeStrategyForm from "./pages/MergeStrategyForm";
import MatchRules from "./pages/MatchRules";
import History from "./pages/History";
import MergeDetail from "./pages/MergeDetail";
import PendingMatches from "./pages/PendingMatches";
import AllPendingMatches from "./pages/AllPendingMatches";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import StatsSummary from "./pages/StatsSummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LocationProvider>
          <UpgradeModalProvider>
            <MainLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/match-rules" element={<MatchRules />} />
              <Route path="/match-rules/new" element={<MatchRuleForm />} />
              <Route path="/match-rules/:id" element={<MatchRuleDetail />} />
              <Route path="/match-rules/:id/edit" element={<MatchRuleForm />} />
              <Route path="/match-rules/:id/review/:matchId" element={<MatchReview />} />
              <Route path="/match-rules/:id/matches" element={<PendingMatches />} />
              <Route path="/merge-strategies" element={<MergeStrategies />} />
              <Route path="/merge-strategies/new" element={<MergeStrategyForm />} />
              <Route path="/merge-strategies/:id/edit" element={<MergeStrategyForm />} />
              <Route path="/pending-matches" element={<AllPendingMatches />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:mergeId" element={<MergeDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/stats" element={<StatsSummary />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </MainLayout>
          </UpgradeModalProvider>
        </LocationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
