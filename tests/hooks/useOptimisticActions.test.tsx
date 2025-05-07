import { describe, it, expect } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useOptimisticActions } from "../../src/hooks/useOptimisticActions"
import { startTransition } from "react"

describe("useOptimisticActions", () => {
  it("should initialize with the initial state", () => {
    const initialState = [{ id: 1, text: "Item 1" }]

    const { result } = renderHook(() => useOptimisticActions(initialState, (state, action) => state))

    expect(result.current[0]).toEqual(initialState)
  })

  it.skip("should apply optimistic updates correctly", async () => {
    const initialState = [{ id: 1, text: "Item 1" }]

    const updateFn = (state: any[], action: any) => {
      if (action.type === "add") {
        return [...state, action.item]
      }
      return state
    }

    const { result } = renderHook(() => useOptimisticActions(initialState, updateFn))

    act(() => {
      startTransition(() => {
        result.current[1]({
          type: "add",
          item: { id: 2, text: "Item 2" },
        })
      })
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual([
        { id: 1, text: "Item 1" },
        { id: 2, text: "Item 2" },
      ])
    })
  })

  it.skip("should handle multiple updates", async () => {
    const initialState = [{ id: 1, text: "Item 1" }]

    const updateFn = (state: any[], action: any) => {
      switch (action.type) {
        case "add":
          return [...state, action.item]
        case "remove":
          return state.filter((item) => item.id !== action.id)
        case "update":
          return state.map((item) => (item.id === action.id ? { ...item, ...action.data } : item))
        default:
          return state
      }
    }

    const { result } = renderHook(() => useOptimisticActions(initialState, updateFn))

    act(() => {
      startTransition(() => {
        result.current[1]({
          type: "add",
          item: { id: 2, text: "Item 2" },
        })
      })
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual([
        { id: 1, text: "Item 1" },
        { id: 2, text: "Item 2" },
      ])
    })

    act(() => {
      startTransition(() => {
        result.current[1]({
          type: "update",
          id: 1,
          data: { text: "Updated Item 1" },
        })
      })
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual([
        { id: 1, text: "Updated Item 1" },
        { id: 2, text: "Item 2" },
      ])
    })

    act(() => {
      startTransition(() => {
        result.current[1]({
          type: "remove",
          id: 2,
        })
      })
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual([{ id: 1, text: "Updated Item 1" }])
    })
  })
})
