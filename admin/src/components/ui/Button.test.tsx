import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button component", () => {
  it("renders with children", () => {
    const { container } = render(<Button>Test Button</Button>);
    expect(container.textContent).toContain("Test Button");
  });
});
