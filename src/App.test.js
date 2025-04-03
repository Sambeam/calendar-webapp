import { render, screen } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom";

test("renders login screen initially", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
});

