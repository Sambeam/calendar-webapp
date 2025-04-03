import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import "@testing-library/jest-dom";

// ✅ Mock Firebase Realtime Database
jest.mock("firebase/database", () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
}));

// ✅ Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (auth, callback) => {
    callback({ email: "test@example.com", uid: "123" });
    return () => {}; // mock unsubscribe
  },
}));

// ✅ Mock firebase config file
jest.mock("../firebase", () => {
  return {
    auth: { currentUser: { email: "test@example.com", uid: "123" } },
  };
});

describe("Dashboard Component", () => {
  test("renders Dashboard with user's email", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  test("renders the Settings button", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const settingsButton = screen.getByRole("button", { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  test("opens Settings modal and shows dark mode toggle", () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const settingsButton = screen.getByRole("button", { name: /settings/i });
    fireEvent.click(settingsButton);

    expect(screen.getByText(/enable dark mode/i)).toBeInTheDocument();
  });
});
