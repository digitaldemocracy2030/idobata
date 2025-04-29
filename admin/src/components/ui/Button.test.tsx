import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button component", () => {
  it("renders with children", () => {
    render(<Button>Test Button</Button>);
    const buttonElement = screen.getByText("Test Button");
    expect(buttonElement).toBeDefined();
    expect(buttonElement.textContent).toBe("Test Button");
  });
});
