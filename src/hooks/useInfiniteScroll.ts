"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useInView } from "react-intersection-observer"

export interface UseInfiniteScrollOptions<T> {
  /**
   * Function that fetches the next page of data
   * @param page The page number to fetch
   * @returns A promise that resolves to the next page of data
   */
  fetchItems: (page: number) => Promise<T[]>

  /**
   * Initial page number (default: 1)
   */
  initialPage?: number

  /**
   * The threshold for when to fetch the next page (default: 0.5)
   * A value of 0.5 means the next page will be fetched when 50% of the last item is visible
   */
  threshold?: number

  /**
   * Whether to start loading data immediately (default: true)
   */
  loadImmediately?: boolean

  /**
   * Initial items to start with (default: [])
   */
  initialItems?: T[]
}

export interface UseInfiniteScrollResult<T> {
  /**
   * The items that have been loaded
   */
  items: T[]

  /**
   * Whether more items are being loaded
   */
  loading: boolean

  /**
   * Whether there was an error loading items
   */
  error: Error | null

  /**
   * Whether there are more items to load
   */
  hasMore: boolean

  /**
   * Function to manually load more items
   */
  loadMore: () => Promise<void>

  /**
   * Ref to attach to the last item in the list
   */
  lastItemRef: (node: Element | null) => void

  /**
   * Function to reset the list and start over
   */
  reset: () => void

  /**
   * Function to update items manually (useful for optimistic updates)
   */
  setItems: React.Dispatch<React.SetStateAction<T[]>>

  /**
   * Current page number
   */
  page: number
}

/**
 * A hook for implementing infinite scrolling with optimistic updates
 * @param options Configuration options for the infinite scroll
 * @returns An object containing the infinite scroll state and controls
 */
export function useInfiniteScroll<T>({
  fetchItems,
  initialPage = 1,
  threshold = 0.5,
  loadImmediately = true,
  initialItems = [],
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>(initialItems)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)

  const { ref: lastItemRef, inView } = useInView({
    threshold,
    triggerOnce: false,
  })

  const loadItems = useCallback(
    async (pageToLoad: number) => {
      if (loadingRef.current) return

      loadingRef.current = true
      setLoading(true)
      setError(null)

      try {
        const newItems = await fetchItems(pageToLoad)

        setHasMore(newItems.length > 0)
        setItems((prev) => [...prev, ...newItems])
        setPage(pageToLoad + 1)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred while fetching items"))
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [fetchItems],
  )

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return
    await loadItems(page)
  }, [hasMore, loadItems, page])

  const reset = useCallback(() => {
    setItems(initialItems)
    setPage(initialPage)
    setHasMore(true)
    setError(null)
    setLoading(false)
    loadingRef.current = false
  }, [initialItems, initialPage])

  // Load initial items
  useEffect(() => {
    if (loadImmediately && hasMore && items.length === 0) {
      loadItems(page)
    }
  }, [loadImmediately, loadItems, page, hasMore, items.length])

  // Load more items when the last item comes into view
  useEffect(() => {
    if (inView && hasMore && !loadingRef.current) {
      loadMore()
    }
  }, [inView, hasMore, loadMore])

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    lastItemRef,
    reset,
    setItems,
    page,
  }
}
