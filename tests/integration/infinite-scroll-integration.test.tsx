"use client"

import "@testing-library/jest-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useInfiniteScroll } from "../../src/hooks/useInfiniteScroll"
import { InfiniteScroll } from "../../src/components/InfiniteScroll"
import { useOptimisticActions } from "../../src/hooks/useOptimisticActions"
import React from "react"

// Create a test component that uses all three hooks/components
function TestComponent() {
  const mockFetchItems = vi.fn().mockImplementation(async (page) => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: (page - 1) * 3 + i + 1,
      name: `Item ${(page - 1) * 3 + i + 1}`,
    }))
  })

  const scrollResult = useInfiniteScroll({
    fetchItems: mockFetchItems,
  })

  type Item = { id: number; name: string }
  type Action = { type: "ADD_ITEM"; item: Item } | { type: "REMOVE_ITEM"; id: number }

  const [optimisticItems, addOptimisticAction] = useOptimisticActions<Item, Action>(scrollResult.items as Item[], (state, action) => {
    switch (action.type) {
      case "ADD_ITEM":
        return [...state, action.item]
      case "REMOVE_ITEM":
        return state.filter((item) => item.id !== action.id)
      default:
        return state
    }
  })

  const handleAddItem = () => {
    const newItem = { id: Date.now(), name: "New Item" }
    React.startTransition(() => {
      addOptimisticAction({ type: "ADD_ITEM", item: newItem })
    })

    // In a real app, you would make an API call here
    setTimeout(() => {
      scrollResult.setItems([...scrollResult.items, newItem])
    }, 100)
  }

  const handleRemoveItem = (id: number) => {
    React.startTransition(() => {
      addOptimisticAction({ type: "REMOVE_ITEM", id })
    })

    // In a real app, you would make an API call here
    setTimeout(() => {
      scrollResult.setItems(scrollResult.items.filter((item) => item.id !== id))
    }, 100)
  }

  return (
    <div>
      <button onClick={handleAddItem}>Add Item</button>
      <button onClick={scrollResult.loadMore}>Load More</button>
      <button onClick={scrollResult.reset}>Reset</button>

      <InfiniteScroll
        scrollResult={{
          ...scrollResult,
          items: optimisticItems,
        }}
        renderItem={(item, index, ref) => {
          const typedItem = item as Item;
          return (
            <div key={typedItem.id} ref={ref} data-testid={`item-${typedItem.id}`}>
              {typedItem.name}
              <button onClick={() => handleRemoveItem(typedItem.id)}>Remove</button>
            </div>
          );
        }}
        loadingComponent={<div data-testid="loading">Loading...</div>}
        emptyComponent={<div data-testid="empty">No items found</div>}
        endComponent={<div data-testid="end">No more items</div>}
      />
    </div>
  )
}

describe("Infinite Scroll Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render initial items and load more when button is clicked", async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    // Wait for initial items to load
    await waitFor(() => {
      expect(screen.getByTestId("item-1")).toBeInTheDocument()
      expect(screen.getByTestId("item-2")).toBeInTheDocument()
      expect(screen.getByTestId("item-3")).toBeInTheDocument()
    })

    // Click load more
    await user.click(screen.getByText("Load More"))

    // Wait for more items to load
    await waitFor(() => {
      expect(screen.getByTestId("item-4")).toBeInTheDocument()
      expect(screen.getByTestId("item-5")).toBeInTheDocument()
      expect(screen.getByTestId("item-6")).toBeInTheDocument()
    })
  })

  it("should add item optimistically", async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    // Wait for initial items to load
    await waitFor(() => {
      expect(screen.getByTestId("item-1")).toBeInTheDocument()
    })

    // Add a new item
    await user.click(screen.getByText("Add Item"))

    // The new item should be added immediately (optimistically)
    await waitFor(() => {
      expect(screen.getByText("New Item")).toBeInTheDocument()
    })
  })

  it("should remove item optimistically", async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    // Wait for initial items to load
    await waitFor(() => {
      expect(screen.getByTestId("item-1")).toBeInTheDocument()
    })

    // Remove an item
    await user.click(screen.getAllByText("Remove")[0])

    // The item should be removed immediately (optimistically)
    await waitFor(() => {
      expect(screen.queryByTestId("item-1")).not.toBeInTheDocument()
    })
  })

  it("should reset the list when reset button is clicked", async () => {
    const user = userEvent.setup()
    render(<TestComponent />)

    // Wait for initial items to load
    await waitFor(() => {
      expect(screen.getByTestId("item-1")).toBeInTheDocument()
    })

    // Load more items
    await user.click(screen.getByText("Load More"))

    // Wait for more items to load
    await waitFor(() => {
      expect(screen.getByTestId("item-4")).toBeInTheDocument()
    })

    // Reset the list
    await user.click(screen.getByText("Reset"))

    // The list should be reset and reload the first page
    await waitFor(() => {
      expect(screen.queryByTestId("item-4")).not.toBeInTheDocument()
      expect(screen.getByTestId("item-1")).toBeInTheDocument()
    })
  })
})
