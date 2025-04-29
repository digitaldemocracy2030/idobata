import "@testing-library/jest-dom";

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown> {
      toBeInTheDocument(): T;
    }
  }
}
