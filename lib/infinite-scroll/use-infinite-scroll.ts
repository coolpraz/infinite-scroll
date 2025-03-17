"use client"

import { useCallback, useState, useOptimistic } from "react"
import { useInView } from "react-intersection-observer"

export type InfiniteScrollOptions<T> = {
  /**
   * Initial data to populate the list
   */
  initialData?: T[]

  /**
   * Function to fetch more data
   * @param page Current page number
   * @returns Promise with array of items
   */
  fetchData: (page: number) => Promise<T[]>

  /**
   * Number of items to fetch per page
   * @default 10
   */
  pageSize?: number

  /**
   * Initial page number
   * @default 1
   */
  initialPage?: number

  /**
   * Threshold for intersection observer
   * @default 0.1
   */
  threshold?: number

  /**
   * Root margin for intersection observer
   * @default "0px"
   */
  rootMargin?: string

  /**
   * Function to get unique ID from item
   * @default item => item.id
   */
  getItemId?: (item: T) => string

  /**
   * Whether to show optimistic UI updates
   * @default true
   */
  optimisticUpdates?: boolean

  /**
   * Function to create optimistic placeholder items
   */
  createPlaceholder?: (index: number) => T
}

export type InfiniteScrollResult<T> = {
  /**
   * All items including optimistic ones
   */
  items: T[]

  /**
   * Whether more items are available
   */
  hasMore: boolean

  /**
   * Whether items are currently loading
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Function to load more items
   */
  loadMore: () => Promise<void>

  /**
   * InView ref to attach to the last item
   */
  inViewRef: (node?: Element | null) => void

  /**
   * Whether the last item is in view
   */
  inView: boolean

  /**
   * Whether an item is an optimistic placeholder
   */
  isOptimisticItem: (item: T) => boolean

  /**
   * Reset the infinite scroll state
   */
  reset: () => void
}

/**
 * Hook for implementing infinite scroll functionality using react-intersection-observer
 */
export function useInfiniteScroll<T extends object>(options: InfiniteScrollOptions<T>): InfiniteScrollResult<T> {
  const {
    initialData = [],
    fetchData,
    pageSize = 10,
    initialPage = 1,
    threshold = 0.1,
    rootMargin = "0px",
    getItemId = (item: any) => item.id,
    optimisticUpdates = true,
    createPlaceholder,
  } = options

  const [items, setItems] = useState<T[]>(initialData)
  const [optimisticItems, addOptimisticItems] = useOptimistic(items, (state, newItems: T[]) => [...state, ...newItems])

  const [page, setPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Setup react-intersection-observer
  const { ref: inViewRef, inView } = useInView({
    threshold,
    rootMargin,
    // Only trigger once unless disabled and re-enabled
    triggerOnce: false,
    // Skip if loading or no more items
    skip: isLoading || !hasMore,
  })

  const isOptimisticItem = useCallback(
    (item: T) => {
      const id = getItemId(item)
      return typeof id === "string" && id.startsWith("optimistic-")
    },
    [getItemId],
  )

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    // Create optimistic UI updates with placeholder items if enabled
    if (optimisticUpdates && createPlaceholder) {
      const optimisticPlaceholders = Array.from({ length: pageSize }, (_, i) => createPlaceholder(i))

      addOptimisticItems(optimisticPlaceholders)
    }

    try {
      const newItems = await fetchData(page)

      if (newItems.length === 0) {
        setHasMore(false)
        // Remove optimistic placeholders if no new items
        if (optimisticUpdates) {
          setItems((items) => items.filter((item) => !isOptimisticItem(item)))
        }
      } else {
        // Replace optimistic placeholders with real data
        if (optimisticUpdates) {
          setItems((items) => [...items.filter((item) => !isOptimisticItem(item)), ...newItems])
        } else {
          setItems((items) => [...items, ...newItems])
        }

        setPage((prevPage) => prevPage + 1)
        setHasMore(newItems.length === pageSize)
      }
    } catch (err) {
      setError("Failed to load more items. Please try again.")
      // Remove optimistic placeholders on error
      if (optimisticUpdates) {
        setItems((items) => items.filter((item) => !isOptimisticItem(item)))
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [
    page,
    isLoading,
    hasMore,
    fetchData,
    pageSize,
    optimisticUpdates,
    createPlaceholder,
    addOptimisticItems,
    isOptimisticItem,
  ])

  // Auto-load more items when the last item comes into view
  if (inView && !isLoading && hasMore) {
    loadMore()
  }

  const reset = useCallback(() => {
    setItems(initialData)
    setPage(initialPage)
    setHasMore(true)
    setIsLoading(false)
    setError(null)
  }, [initialData, initialPage])

  return {
    items: optimisticItems,
    hasMore,
    isLoading,
    error,
    loadMore,
    inViewRef,
    inView,
    isOptimisticItem,
    reset,
  }
}

