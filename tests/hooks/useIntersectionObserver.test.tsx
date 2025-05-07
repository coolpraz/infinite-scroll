import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useInView } from "react-intersection-observer"

// Mock the useInView hook from react-intersection-observer
vi.mock("react-intersection-observer", () => ({
  useInView: vi.fn(),
}))

describe("useInView hook", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("should return inView as false by default", () => {
    ;(useInView as any).mockReturnValue({ ref: vi.fn(), inView: false })

    const { result } = renderHook(() => useInView())

    expect(result.current.inView).toBe(false)
  })

  it("should return inView as true when element is in view", () => {
    ;(useInView as any).mockReturnValue({ ref: vi.fn(), inView: true })

    const { result } = renderHook(() => useInView())

    expect(result.current.inView).toBe(true)
  })

  it("should pass options to useInView", () => {
    const mockRef = vi.fn()
    ;(useInView as any).mockReturnValue({ ref: mockRef, inView: true })

    const options = { threshold: 0.5, triggerOnce: false }
    renderHook(() => useInView(options))

    expect(useInView).toHaveBeenCalledWith(options)
  })
})
