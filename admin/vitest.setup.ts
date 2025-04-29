import "@testing-library/jest-dom";

declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeInTheDocument(): T;
    }
  }
}
