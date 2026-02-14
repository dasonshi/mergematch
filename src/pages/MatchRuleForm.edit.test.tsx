import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MatchRuleForm from "@/pages/MatchRuleForm";
import { api } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/contexts/LocationContext", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn(), toasts: [] }),
}));

const mockedUseLocation = vi.mocked(useLocation);

describe("MatchRuleForm edit behavior", () => {
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

  it("persists user-selected field/algorithm when editing a rule", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "getMatchRule").mockResolvedValue({
      id: "rule-1",
      name: "Email Rule",
      source_object: "contacts",
      match_fields: [
        {
          field: "email",
          algorithm: "exact",
          weight: 1,
          operator: "AND",
        },
      ],
      auto_merge_threshold: 95,
      review_threshold: 70,
      merge_strategy: "standard",
      schedule_frequency: "manual",
      is_active: true,
      merge_settings: { overwrite_blanks: false },
    } as any);

    vi.spyOn(api, "getMatchRules").mockResolvedValue({ data: [] } as any);
    vi.spyOn(api, "getPipelines").mockResolvedValue([]);
    vi.spyOn(api, "getAvailableObjects").mockResolvedValue([
      { id: "contacts", name: "Contacts", standard: true },
    ]);
    vi.spyOn(api, "getObjectFields").mockResolvedValue([
      {
        id: "email",
        sourceId: "email",
        name: "Email",
        fieldKey: "email",
        dataType: "TEXT",
        isCustom: false,
      },
      {
        id: "name",
        sourceId: "name",
        name: "Full Name",
        fieldKey: "name",
        dataType: "TEXT",
        isCustom: false,
      },
    ] as any);

    renderWithProviders(
      <Routes>
        <Route path="/match-rules/:id/edit" element={<MatchRuleForm />} />
      </Routes>,
      { initialEntries: ["/match-rules/rule-1/edit"] }
    );

    expect(await screen.findByText("Edit Match Rule")).toBeInTheDocument();
    expect(await screen.findByText("Email (Exact Match)")).toBeInTheDocument();

    const comboboxes = screen.getAllByRole("combobox");
    await user.click(comboboxes[0]);
    await user.click(await screen.findByRole("option", { name: "Full Name" }));

    await waitFor(() => {
      expect(screen.getByText("Full Name (Exact Match)")).toBeInTheDocument();
    });

    await user.click(screen.getAllByRole("combobox")[1]);
    await user.click(await screen.findByRole("option", { name: "Fuzzy Match (85%)" }));

    await waitFor(() => {
      expect(screen.getByText("Full Name (Fuzzy Match (85%))")).toBeInTheDocument();
      expect(screen.queryByText("Email (Exact Match)")).not.toBeInTheDocument();
    });
  });
});
