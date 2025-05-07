import type React from "react"
import { forwardRef, type ReactNode } from "react"
import type { UseInfiniteScrollResult } from "../hooks/useInfiniteScroll"

export interface InfiniteScrollProps<T> {
  /**
   * The result object from the useInfiniteScroll hook
   */
  scrollResult: UseInfiniteScrollResult<T>

  /**
   * A function that renders an item
   * @param item The item to render
   * @param index The index of the item
   * @param lastItemRef A ref to attach to the last item
   * @returns A React node
   */
  renderItem: (item: T, index: number, lastItemRef: (node: Element | null) => void) => ReactNode

  /**
   * A component to show when loading more items
   */
  loadingComponent?: ReactNode

  /**
   * A component to show when there's an error
   */
  errorComponent?: ReactNode

  /**
   * A component to show when there are no more items
   */
  endComponent?: ReactNode

  /**
   * A component to show when there are no items at all
   */
  emptyComponent?: ReactNode

  /**
   * Container className
   */
  className?: string

  /**
   * Container style
   */
  style?: React.CSSProperties

  /**
   * Children to render
   */
  children?: ReactNode
}

/**
 * A component for implementing infinite scrolling with optimistic updates
 */
export const InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps<any>>(function InfiniteScroll<T>(
  {
    scrollResult,
    renderItem,
    loadingComponent = <div>Loading...</div>,
    errorComponent = <div>Error loading items. Try again later.</div>,
    endComponent = <div>No more items to load</div>,
    emptyComponent = <div>No items found</div>,
    className = "",
    style = {},
    children,
  }: InfiniteScrollProps<T>,
  ref,
) {
  const { items, loading, error, hasMore, lastItemRef } = scrollResult

  const isEmpty = items.length === 0 && !loading && !error

  return (
    <div ref={ref} className={className} style={style}>
      {children}

      {items.map((item, index) => {
        const isLastItem = index === items.length - 1
        return renderItem(item, index, isLastItem ? lastItemRef : () => {})
      })}

      {loading && loadingComponent}
      {error && errorComponent}
      {!hasMore && items.length > 0 && endComponent}
      {isEmpty && emptyComponent}
    </div>
  )
})
