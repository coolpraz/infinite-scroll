import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useInfiniteScroll } from "../../src/hooks/useInfiniteScroll"

describe("useInfiniteScroll", () => {
  let mockFetchItems: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetchItems = vi.fn()
  })

  it("should initialize with default values", () => {
    mockFetchItems.mockResolvedValue([])

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchItems: mockFetchItems,
        loadImmediately: false,
      }),
    )

    expect(result.current.items).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.hasMore).toBe(true)
    expect(result.current.page).toBe(1)
  })

  it("should load items immediately by default", async () => {
    mockFetchItems.mockResolvedValue([{ id: 1, name: "Item 1" }])

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchItems: mockFetchItems,
      }),
    )

    // Initially loading should be true
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledWith(1)
      expect(result.current.items).toEqual([{ id: 1, name: "Item 1" }])
      expect(result.current.loading).toBe(false)
      expect(result.current.page).toBe(2)
    })
  })

  it("should load more items when loadMore is called", async () => {
    mockFetchItems.mockResolvedValueOnce([{ id: 1, name: "Item 1" }]).mockResolvedValueOnce([{ id: 2, name: "Item 2" }])

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchItems: mockFetchItems,
      }),
    )

    await waitFor(() => {
      expect(result.current.items).toEqual([{ id: 1, name: "Item 1" }])
      expect(result.current.page).toBe(2)
    })

    act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledWith(2)
      expect(result.current.items).toEqual([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ])
      expect(result.current.page).toBe(3)
    })
  })

  it("should handle errors", async () => {
    const error = new Error("Failed to fetch")
    mockFetchItems.mockRejectedValue(error)

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchItems: mockFetchItems,
      }),
    )

    await waitFor(() => {
      expect(result.current.error).toEqual(error)
      expect(result.current.loading).toBe(false)
    })
  })

  it("should set hasMore to false when no more items", async () => {
    mockFetchItems.mockResolvedValueOnce([{ id: 1, name: "Item 1" }]).mockResolvedValueOnce([])

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchItems: mockFetchItems,
      }),
    )

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true)
    })

    act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false)
    })
  })

  it("should reset state when reset is called", async () => {
    mockFetchItems.mockResolvedValue([{ id: 1, name: "Item 1" }])

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchItems: mockFetchItems,
        initialItems: [{ id: 0, name: "Initial Item" }],
        loadImmediately: false,
      }),
    )

    act(() => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.items).toEqual([
        { id: 0, name: "Initial Item" },
        { id: 1, name: "Item 1" },
      ])
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.items).toEqual([{ id: 0, name: "Initial Item" }])
    expect(result.current.page).toBe(1)
    expect(result.current.hasMore).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it("should not duplicate loading calls", async () => {
    // Mock a slow response
    mockFetchItems.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([{ id: 1, name: "Item 1" }]), 100)
      })
    })

    const { result } = renderHook(() =>
      useInfiniteScroll({
        fetchItems: mockFetchItems,
      }),
    )

    // Call loadMore while the first request is still loading
    act(() => {
      result.current.loadMore()
      result.current.loadMore()
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(mockFetchItems).toHaveBeenCalledTimes(1)
    })
  })
})
