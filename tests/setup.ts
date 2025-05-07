import "@testing-library/jest-dom/vitest"

// Mock IntersectionObserver for tests
class MockIntersectionObserver {
  readonly root: Element | null
  readonly rootMargin: string
  readonly thresholds: ReadonlyArray<number>

  constructor() {
    this.root = null
    this.rootMargin = ""
    this.thresholds = []
  }

  disconnect() {
    return null
  }

  observe() {
    return null
  }

  takeRecords() {
    return []
  }

  unobserve() {
    return null
  }
}

global.IntersectionObserver = MockIntersectionObserver as any
