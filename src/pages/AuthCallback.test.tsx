import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthCallback from "@/pages/AuthCallback";

const mockExchangeCodeForSession = vi.fn();
const mockVerifyOtp = vi.fn();
const mockGetSession = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("@/services/supabaseClient", () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

describe("AuthCallback", () => {
  beforeEach(() => {
    mockExchangeCodeForSession.mockReset();
    mockVerifyOtp.mockReset();
    mockGetSession.mockReset();
    mockToastSuccess.mockReset();
    mockToastError.mockReset();

    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    mockVerifyOtp.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1" } } },
      error: null,
    });
  });

  it("exchanges a code and redirects verified users to onboarding", async () => {
    window.history.replaceState({}, "", "/auth/callback?code=signup-code");

    render(
      <MemoryRouter initialEntries={["/auth/callback?code=signup-code"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<div>Onboarding page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Email confirmation")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockExchangeCodeForSession).toHaveBeenCalledWith("signup-code");
      expect(screen.getByText("Onboarding page")).toBeInTheDocument();
    });

    expect(mockToastSuccess).toHaveBeenCalled();
  });

  it("verifies a token hash callback and falls back to auth on failure", async () => {
    mockVerifyOtp.mockResolvedValue({
      error: new Error("Invalid or expired link."),
    });

    window.history.replaceState({}, "", "/auth/callback?token_hash=hash-1&type=signup");

    render(
      <MemoryRouter initialEntries={["/auth/callback?token_hash=hash-1&type=signup"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth" element={<div>Auth page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        token_hash: "hash-1",
        type: "signup",
      });
      expect(screen.getByText("Auth page")).toBeInTheDocument();
    });

    expect(mockToastError).toHaveBeenCalled();
  });

  it("redirects recovery callbacks to reset-password instead of onboarding", async () => {
    window.history.replaceState({}, "", "/auth/callback?token_hash=hash-2&type=recovery");

    render(
      <MemoryRouter initialEntries={["/auth/callback?token_hash=hash-2&type=recovery"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<div>Reset password page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        token_hash: "hash-2",
        type: "recovery",
      });
      expect(screen.getByText("Reset password page")).toBeInTheDocument();
    });
  });
});
