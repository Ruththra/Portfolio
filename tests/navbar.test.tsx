import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/layout/navbar";

vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));
describe("mobile navigation", () => {
  it("opens and closes from its accessible control", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const button = screen.getByRole("button", { name: /open navigation/i });
    await user.click(button);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /close navigation/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
