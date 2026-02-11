import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/test-utils";
import MatchReview from "@/pages/MatchReview";
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

describe("non-contact field rendering", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
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

  it("renders MatchReview custom-object fields from resolver pipeline", async () => {
    vi.spyOn(api, "getMatch").mockResolvedValue({
      id: "match-1",
      rule_id: "rule-1",
      record_a_id: "a-1",
      record_b_id: "b-1",
      confidence_score: 0.91,
      field_scores: {},
      status: "pending",
      record_a_data: {
        id: "a-1",
        _raw: { properties: { vehicle_name: "Roadster A" } },
      },
      record_b_data: {
        id: "b-1",
        _raw: { properties: { vehicle_name: "Roadster B" } },
      },
    } as any);

    vi.spyOn(api, "getMatchRule").mockResolvedValue({
      id: "rule-1",
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

    vi.spyOn(api, "getMergeQuota").mockResolvedValue({
      allowed: true,
      used: 1,
      limit: 1000,
      remaining: 999,
    });

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

    renderWithProviders(
      <Routes>
        <Route path="/match-rules/:id/review/:matchId" element={<MatchReview />} />
      </Routes>,
      { initialEntries: ["/match-rules/rule-1/review/match-1"] }
    );

    expect(await screen.findByText("Vehicle Name")).toBeInTheDocument();
    expect(screen.getAllByText("Roadster A").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Roadster B").length).toBeGreaterThan(0);
  });

  it("renders MergeDetail custom-object snapshots with resolver-derived labels and values", async () => {
    vi.spyOn(api, "getMerge").mockResolvedValue({
      id: "merge-1",
      master_record_id: "a-1",
      duplicate_record_id: "b-1",
      status: "rolled_back",
      restored_record_id: "b-restored-1",
      created_at: "2026-02-10T12:00:00Z",
      source_object: "custom_objects.vehicles",
      ghl_location_id: "ghl-loc-1",
      field_selections: {
        "customField.vehicle_name": "a",
      },
      master_snapshot: {
        id: "a-1",
        _raw: { properties: { vehicle_name: "Master Roadster" } },
      },
      duplicate_snapshot: {
        id: "b-1",
        _raw: { properties: { vehicle_name: "Duplicate Roadster" } },
      },
      rule: {
        id: "rule-1",
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

    vi.spyOn(api, "getAvailableObjects").mockResolvedValue([
      {
        id: "custom_objects.vehicles",
        name: "Vehicles",
        standard: false,
        displayField: "customField.vehicle_name",
      },
    ]);

    renderWithProviders(
      <Routes>
        <Route path="/history/:mergeId" element={<MergeDetail />} />
      </Routes>,
      { initialEntries: ["/history/merge-1"] }
    );

    expect(await screen.findByText("Vehicle Name")).toBeInTheDocument();
    expect(screen.getAllByText("Master Roadster").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Duplicate Roadster").length).toBeGreaterThan(0);
    expect(screen.getByText("New ID: b-restored-1")).toBeInTheDocument();
  });
});
