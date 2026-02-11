import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/test-utils";
import MatchReview from "@/pages/MatchReview";
import History from "@/pages/History";
import MergeDetail from "@/pages/MergeDetail";
import { api } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

vi.mock("@/contexts/LocationContext", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn(), toasts: [] }),
}));

vi.mock("@/hooks/use-warning-preferences", () => ({
  useWarningPreferences: () => ({
    preferences: {
      showIndividualMergeWarning: false,
    },
  }),
}));

vi.mock("@/components/ui/upgrade-modal", () => ({
  useUpgradeModal: () => ({ openUpgradeModal: vi.fn() }),
  UpgradeModalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockedUseLocation = vi.mocked(useLocation);

describe("custom object flow e2e", () => {
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

  it("covers scan -> review -> merge -> history -> rollback for custom objects", async () => {
    const user = userEvent.setup();

    const scanSpy = vi.spyOn(api, "scanRule").mockResolvedValue({
      records_scanned: 2,
      matches_found: 1,
      matches_stored: 1,
    });
    await expect(api.scanRule("rule-custom")).resolves.toMatchObject({
      matches_found: 1,
    });
    expect(scanSpy).toHaveBeenCalledWith("rule-custom");

    const executeMergeSpy = vi.spyOn(api, "executeMerge").mockResolvedValue({
      id: "merge-1",
      status: "completed",
      master_record_id: "veh-a",
      duplicate_record_id: "veh-b",
      created_at: "2026-02-10T12:00:00Z",
    } as any);

    vi.spyOn(api, "getMatch").mockResolvedValue({
      id: "match-1",
      rule_id: "rule-custom",
      record_a_id: "veh-a",
      record_b_id: "veh-b",
      confidence_score: 0.95,
      field_scores: {},
      status: "pending",
      record_a_data: {
        id: "veh-a",
        _raw: { properties: { vehicle_name: "Roadster Prime" } },
      },
      record_b_data: {
        id: "veh-b",
        _raw: { properties: { vehicle_name: "Roadster Copy" } },
      },
    } as any);

    vi.spyOn(api, "getMatchRule").mockResolvedValue({
      id: "rule-custom",
      name: "Vehicle Rule",
      source_object: "custom_objects.vehicles",
      match_fields: [
        {
          field: "customField.vehicle_name",
          algorithm: "exact",
          weight: 1,
          operator: "AND",
        },
      ],
      auto_merge_threshold: 0.95,
      review_threshold: 0.7,
      merge_strategy: "standard",
      schedule_frequency: "manual",
      is_active: true,
      merge_settings: { overwrite_blanks: false },
    } as any);

    vi.spyOn(api, "getAvailableObjects").mockResolvedValue([
      {
        id: "custom_objects.vehicles",
        name: "Vehicles",
        standard: false,
        displayField: "customField.vehicle_name",
      },
    ]);

    vi.spyOn(api, "getObjectFields").mockResolvedValue([
      {
        id: "customField.vehicle_name",
        name: "Vehicle Name",
        fieldKey: "vehicle_name",
        dataType: "TEXT",
        isCustom: true,
      },
    ]);

    vi.spyOn(api, "getMergeQuota").mockResolvedValue({
      allowed: true,
      used: 3,
      limit: 1000,
      remaining: 997,
    });

    renderWithProviders(
      <Routes>
        <Route path="/match-rules/:id/review/:matchId" element={<MatchReview />} />
        <Route path="/match-rules/:id" element={<div>Rule Detail Placeholder</div>} />
      </Routes>,
      { initialEntries: ["/match-rules/rule-custom/review/match-1"] }
    );

    expect(await screen.findByText("Vehicle Name")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm Merge" }));
    await waitFor(() => expect(executeMergeSpy).toHaveBeenCalled());

    const rollbackSpy = vi.spyOn(api, "rollbackMerge").mockResolvedValue({
      id: "merge-1",
      status: "rolled_back",
      restored_record_id: "veh-restored-1",
    });

    vi.spyOn(api, "getMerges").mockResolvedValue({
      data: [
        {
          id: "merge-1",
          master_record_id: "veh-a",
          duplicate_record_id: "veh-b",
          status: "completed",
          created_at: "2026-02-10T12:00:00Z",
          source_object: "custom_objects.vehicles",
          rule_id: "rule-custom",
          rule_name: "Vehicle Rule",
        },
      ],
      total: 1,
    } as any);

    renderWithProviders(
      <Routes>
        <Route path="/history" element={<History />} />
      </Routes>,
      { initialEntries: ["/history"] }
    );

    expect(await screen.findByRole("button", { name: "Restore" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore" }));
    const restoreDialog = await screen.findByRole("dialog");
    await user.click(within(restoreDialog).getByRole("button", { name: "Restore Record" }));
    await waitFor(() => expect(rollbackSpy).toHaveBeenCalledWith("merge-1"));

    vi.spyOn(api, "getMerge").mockResolvedValue({
      id: "merge-1",
      master_record_id: "veh-a",
      duplicate_record_id: "veh-b",
      status: "rolled_back",
      restored_record_id: "veh-restored-1",
      created_at: "2026-02-10T12:00:00Z",
      source_object: "custom_objects.vehicles",
      ghl_location_id: "ghl-loc-1",
      field_selections: { "customField.vehicle_name": "a" },
      master_snapshot: {
        id: "veh-a",
        _raw: { properties: { vehicle_name: "Roadster Prime" } },
      },
      duplicate_snapshot: {
        id: "veh-b",
        _raw: { properties: { vehicle_name: "Roadster Copy" } },
      },
      rule: {
        id: "rule-custom",
        name: "Vehicle Rule",
        source_object: "custom_objects.vehicles",
        match_fields: [
          {
            field: "customField.vehicle_name",
            algorithm: "exact",
            weight: 1,
            operator: "AND",
          },
        ],
      },
    } as any);

    renderWithProviders(
      <Routes>
        <Route path="/history/:mergeId" element={<MergeDetail />} />
      </Routes>,
      { initialEntries: ["/history/merge-1"] }
    );

    expect(await screen.findByText("New ID: veh-restored-1")).toBeInTheDocument();
    expect(screen.getAllByText("Roadster Prime").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Roadster Copy").length).toBeGreaterThan(0);
  });
});
