import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { InfiniteScroll } from "../../src/components/InfiniteScroll"

describe("InfiniteScroll", () => {
  const mockScrollResult = {
    items: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ],
    loading: false,
    error: null,
    hasMore: true,
    loadMore: vi.fn(),
    lastItemRef: vi.fn(),
    reset: vi.fn(),
    setItems: vi.fn(),
    page: 1,
  }

  it("should render items correctly", () => {
    render(
      <InfiniteScroll scrollResult={mockScrollResult} renderItem={(item) => <div key={item.id}>{item.name}</div>} />,
    )

    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 2")).toBeInTheDocument()
  })

  it("should render loading component when loading", () => {
    render(
      <InfiniteScroll
        scrollResult={{ ...mockScrollResult, loading: true }}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        loadingComponent={<div>Custom Loading...</div>}
      />,
    )

    expect(screen.getByText("Custom Loading...")).toBeInTheDocument()
  })

  it("should render error component when there is an error", () => {
    render(
      <InfiniteScroll
        scrollResult={{
          ...mockScrollResult,
          error: new Error("Test error"),
        }}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        errorComponent={<div>Custom Error</div>}
      />,
    )

    expect(screen.getByText("Custom Error")).toBeInTheDocument()
  })

  it("should render end component when there are no more items", () => {
    render(
      <InfiniteScroll
        scrollResult={{ ...mockScrollResult, hasMore: false }}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        endComponent={<div>No More Items</div>}
      />,
    )

    expect(screen.getByText("No More Items")).toBeInTheDocument()
  })

  it("should render empty component when there are no items", () => {
    render(
      <InfiniteScroll
        scrollResult={{ ...mockScrollResult, items: [] }}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        emptyComponent={<div>No Items Found</div>}
      />,
    )

    expect(screen.getByText("No Items Found")).toBeInTheDocument()
  })

  it("should apply custom className and style", () => {
    const { container } = render(
      <InfiniteScroll
        scrollResult={mockScrollResult}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        className="custom-class"
        style={{ margin: "10px" }}
      />,
    )

    const scrollContainer = container.firstChild as HTMLElement
    expect(scrollContainer).toHaveClass("custom-class")
    expect(scrollContainer.style.margin).toBe("10px")
  })

  it("should render children", () => {
    render(
      <InfiniteScroll scrollResult={mockScrollResult} renderItem={(item) => <div key={item.id}>{item.name}</div>}>
        <div>Header Content</div>
      </InfiniteScroll>,
    )

    expect(screen.getByText("Header Content")).toBeInTheDocument()
  })

  it("should pass lastItemRef to the last item", () => {
    const mockLastItemRef = vi.fn()
    const mockItems = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
    ]

    render(
      <InfiniteScroll
        scrollResult={{
          ...mockScrollResult,
          items: mockItems,
          lastItemRef: mockLastItemRef,
        }}
        renderItem={(item, index, ref) => (
          <div key={item.id} ref={index === mockItems.length - 1 ? ref : null}>
            {item.name}
          </div>
        )}
      />,
    )

    // The lastItemRef should be called for the last item only
    expect(mockLastItemRef).toHaveBeenCalledTimes(1)
  })
})
