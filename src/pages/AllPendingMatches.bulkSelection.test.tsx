import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/test-utils";
import AllPendingMatches from "@/pages/AllPendingMatches";
import { api } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

vi.mock("@/contexts/LocationContext", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn(), toasts: [] }),
}));

vi.mock("@/components/ui/upgrade-modal", () => ({
  useUpgradeModal: () => ({ openUpgradeModal: vi.fn() }),
  UpgradeModalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockedUseLocation = vi.mocked(useLocation);

describe("AllPendingMatches bulk selection", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    localStorage.clear();
    mockedUseLocation.mockReturnValue({
      locationId: "loc-1",
      locationName: "Test Location",
      isAuthenticated: true,
      isLoading: false,
      error: null,
      plan: "pro",
      canUseStrategies: true,
      connectionStatus: "connected",
      markTokenExpired: vi.fn(),
      reconnect: vi.fn(),
      isOnTrial: false,
      trialEndsAt: null,
      upgradeUrl: null,
      features: {
        unlimited_merges: true,
        auto_merge: true,
        scheduled_scans: true,
        company_matching: true,
        white_label: false,
      },
      lastWebhookAt: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("applies select-all-matching and sends the full filtered set to bulk merge", async () => {
    const allMatches = [
      {
        id: "match-1",
        rule_id: "rule-1",
        record_a_id: "a-1",
        record_b_id: "b-1",
        confidence_score: 0.92,
        status: "pending",
        field_scores: {},
        record_a_data: { id: "a-1", firstName: "Alice", lastName: "One" },
        record_b_data: { id: "b-1", firstName: "Alicia", lastName: "One" },
      },
      {
        id: "match-2",
        rule_id: "rule-1",
        record_a_id: "a-2",
        record_b_id: "b-2",
        confidence_score: 0.9,
        status: "pending",
        field_scores: {},
        record_a_data: { id: "a-2", firstName: "Bob", lastName: "Two" },
        record_b_data: { id: "b-2", firstName: "Bobby", lastName: "Two" },
      },
      {
        id: "match-3",
        rule_id: "rule-2",
        record_a_id: "a-3",
        record_b_id: "b-3",
        confidence_score: 0.89,
        status: "pending",
        field_scores: {},
        record_a_data: { id: "a-3", firstName: "Cara", lastName: "Three" },
        record_b_data: { id: "b-3", firstName: "Carla", lastName: "Three" },
      },
    ];

    vi.spyOn(api, "getMatchRules").mockResolvedValue({
      data: [
        {
          id: "rule-1",
          name: "Contacts Rule A",
          source_object: "contacts",
          match_fields: [{ field: "email", algorithm: "exact", weight: 1, operator: "AND" }],
          auto_merge_threshold: 0.95,
          review_threshold: 0.7,
          merge_strategy: "standard",
          schedule_frequency: "manual",
          is_active: true,
        },
        {
          id: "rule-2",
          name: "Contacts Rule B",
          source_object: "contacts",
          match_fields: [{ field: "phone", algorithm: "exact", weight: 1, operator: "AND" }],
          auto_merge_threshold: 0.95,
          review_threshold: 0.7,
          merge_strategy: "standard",
          schedule_frequency: "manual",
          is_active: true,
        },
      ],
      total: 2,
    } as any);

    vi.spyOn(api, "getAvailableObjects").mockResolvedValue([
      { id: "contacts", name: "Contacts", standard: true, displayField: "firstName" },
    ]);

    const getMatchesSpy = vi
      .spyOn(api, "getMatches")
      .mockImplementation(async (_status, _ruleId, limit, offset) => {
        if (limit === 1000 && offset === 0) {
          return { data: allMatches, total: allMatches.length };
        }
        return { data: allMatches.slice(offset || 0, (offset || 0) + (limit || 50)), total: allMatches.length };
      });

    vi.spyOn(api, "getMatchCounts").mockResolvedValue({
      total: allMatches.length,
      unique_contacts: allMatches.length,
      by_rule: { "rule-1": 2, "rule-2": 1 },
    });

    const startBulkSpy = vi.spyOn(api, "startBulkMerge").mockResolvedValue({
      job_id: "job-1",
      status: "pending",
      total_count: allMatches.length,
      processed_count: 0,
      success_count: 0,
      failed_count: 0,
    } as any);

    vi.spyOn(api, "getBulkJobStatus").mockResolvedValue({
      job_id: "job-1",
      status: "completed",
      total_count: allMatches.length,
      processed_count: allMatches.length,
      success_count: allMatches.length,
      failed_count: 0,
    } as any);

    vi.spyOn(api, "cancelBulkJob").mockResolvedValue({
      message: "Cancellation requested",
      job_id: "job-1",
    });

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/pending-matches" element={<AllPendingMatches />} />
      </Routes>,
      { initialEntries: ["/pending-matches"] }
    );

    expect(await screen.findByLabelText("Select row 1")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Select row 1"));
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Select all 3 matching" }));
    expect(screen.getByText("3 selected")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Merge Selected" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Merge Selected (3)" }));

    await waitFor(() => {
      expect(startBulkSpy).toHaveBeenCalledWith(["match-1", "match-2", "match-3"], undefined);
    });
    expect(getMatchesSpy).toHaveBeenCalledWith("pending", undefined, 1000, 0, undefined);
  });
});
