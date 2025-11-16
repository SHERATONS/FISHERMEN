import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

// ---- Mock child component to access context ----
function TestComponent() {
  const auth = useAuth();
  return (
    <>
      <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : "null"}</div>
      <button onClick={() => auth.login({ role: "BUYER", id: 99 })} data-testid="login-btn">
        Login
      </button>
      <button onClick={auth.logout} data-testid="logout-btn">
        Logout
      </button>
      <div data-testid="loading">{auth.isLoading ? "loading" : "loaded"}</div>
      <div data-testid="expired">{auth.isSessionExpired().toString()}</div>
    </>
  );
}

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

// ---- Mock localStorage ----
beforeEach(() => {
  Storage.prototype.getItem = jest.fn();
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
  Storage.prototype.clear = jest.fn();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("AuthContext", () => {

  // -----------------------------------------------------------
  // 1. Loads user from localStorage (role & id)
  // -----------------------------------------------------------
  test("initializes user from role & id in localStorage", () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === "role") return JSON.stringify("FISHERMAN");
      if (key === "id") return JSON.stringify(123);
      return null;
    });

    renderWithProvider();

    expect(screen.getByTestId("user").textContent).toContain('"role":"FISHERMAN"');
    expect(screen.getByTestId("user").textContent).toContain('"id":123');
  });

  // -----------------------------------------------------------
  // 2. Fallback: loads from stored full user object
  // -----------------------------------------------------------
  test("restores full user from stored 'user' object", () => {
    localStorage.getItem.mockImplementation((key) => {
      if (key === "user") return JSON.stringify({ role: "BUYER", id: 77 });
      return null;
    });

    renderWithProvider();

    expect(screen.getByTestId("user").textContent).toContain('"role":"BUYER"');
    expect(screen.getByTestId("user").textContent).toContain('"id":77');
  });

  // -----------------------------------------------------------
  // 3. login() stores data in localStorage
  // -----------------------------------------------------------
  test("login() stores role, id, user and timestamp", () => {
    renderWithProvider();

    const loginBtn = screen.getByTestId("login-btn");

    act(() => loginBtn.click());

    expect(localStorage.setItem).toHaveBeenCalledWith("role", JSON.stringify("BUYER"));
    expect(localStorage.setItem).toHaveBeenCalledWith("id", JSON.stringify(99));
    expect(localStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify({ role: "BUYER", id: 99 }));
    expect(localStorage.setItem).toHaveBeenCalledWith("loginTimestamp", expect.any(String));
  });

  // -----------------------------------------------------------
  // 4. logout clears user and localStorage
  // -----------------------------------------------------------
  test("logout() clears user and localStorage", () => {
    localStorage.getItem.mockReturnValue(null);
    renderWithProvider();

    const loginBtn = screen.getByTestId("login-btn");
    const logoutBtn = screen.getByTestId("logout-btn");

    act(() => loginBtn.click());
    act(() => logoutBtn.click());

    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.removeItem).toHaveBeenCalledWith("role");
    expect(localStorage.removeItem).toHaveBeenCalledWith("id");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
  });

  // -----------------------------------------------------------
  // 5. isSessionExpired() returns false for valid session
  // -----------------------------------------------------------
  test("isSessionExpired() returns false when within 24 hours", () => {
    const timestamp = Date.now().toString();
    localStorage.getItem.mockImplementation((key) =>
      key === "loginTimestamp" ? timestamp : null
    );

    renderWithProvider();
    expect(screen.getByTestId("expired").textContent).toBe("false");
  });

  // -----------------------------------------------------------
  // 6. isSessionExpired() returns true when older than 24 hours
  // -----------------------------------------------------------
  test("isSessionExpired() returns true when session older than 24 hours", () => {
    const past = (Date.now() - 25 * 60 * 60 * 1000).toString();

    localStorage.getItem.mockImplementation((key) =>
      key === "loginTimestamp" ? past : null
    );

    renderWithProvider();
    expect(screen.getByTestId("expired").textContent).toBe("true");
  });

  // -----------------------------------------------------------
  // 7. Auto-logout when session expired on mount
  // -----------------------------------------------------------
  test("auto-logout triggers when user exists and session expired", () => {
    const past = (Date.now() - 25 * 60 * 60 * 1000).toString();

    localStorage.getItem.mockImplementation((key) => {
      if (key === "role") return JSON.stringify("BUYER");
      if (key === "id") return JSON.stringify(10);
      if (key === "loginTimestamp") return past;
      return null;
    });

    renderWithProvider();

    // Expect logout to be called via auto effect
    expect(localStorage.removeItem).toHaveBeenCalledWith("role");
    expect(localStorage.removeItem).toHaveBeenCalledWith("id");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
  });

  // -----------------------------------------------------------
  // 8. isLoading switches from true → false after init
  // -----------------------------------------------------------
  test("isLoading becomes false once initialization is complete", async () => {
    localStorage.getItem.mockReturnValue(null);
    renderWithProvider();

    expect(screen.getByTestId("loading").textContent).toBe("loaded");
  });

  // -----------------------------------------------------------
  // 9. useAuth() throws outside provider
  // -----------------------------------------------------------
  test("useAuth throws error when used outside AuthProvider", () => {
    const BadComponent = () => {
      useAuth();
      return <></>;
    };

    expect(() => render(<BadComponent />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );
  });
});
