"use client"

import type { ReactNode } from "react"
import { useInfiniteScroll, type InfiniteScrollOptions } from "./use-infinite-scroll"
import { Loader2 } from "lucide-react"

export type InfiniteScrollProps<T> = {
  /**
   * Options for the infinite scroll hook
   */
  options: Omit<InfiniteScrollOptions<T>, "initialData">

  /**
   * Initial data to populate the list
   */
  initialData?: T[]

  /**
   * Render function for each item
   */
  renderItem: (item: T, index: number, isOptimistic: boolean) => ReactNode

  /**
   * Render function for the container
   * @default (children) => <div className="space-y-4">{children}</div>
   */
  renderContainer?: (children: ReactNode) => ReactNode

  /**
   * Render function for the loading indicator
   * @default () => <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
   */
  renderLoading?: () => ReactNode

  /**
   * Render function for the error message
   */
  renderError?: (error: string, retry: () => void) => ReactNode

  /**
   * Render function for the end of list message
   * @default () => <div className="text-center py-4 text-muted-foreground"><p>No more items to load</p></div>
   */
  renderEndMessage?: () => ReactNode

  /**
   * Class name for the container
   */
  className?: string
}

/**
 * Infinite scroll component that automatically loads more items as the user scrolls
 */
export function InfiniteScroll<T extends object>({
  options,
  initialData = [],
  renderItem,
  renderContainer = (children) => <div className="space-y-4">{children}</div>,
  renderLoading = () => (
    <div className="flex justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
  renderError = (error, retry) => (
    <div className="text-center py-4 text-red-500">
      <p>{error}</p>
      <button
        onClick={retry}
        className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  ),
  renderEndMessage = () => (
    <div className="text-center py-4 text-muted-foreground">
      <p>No more items to load</p>
    </div>
  ),
  className,
}: InfiniteScrollProps<T>) {
  const { items, hasMore, isLoading, error, loadMore, inViewRef, isOptimisticItem } = useInfiniteScroll({
    ...options,
    initialData,
  })

  if (items.length === 0 && isLoading) {
    return renderLoading()
  }

  return (
    <div className={className}>
      {renderContainer(
        <>
          {items.map((item, index) => {
            const isOptimistic = isOptimisticItem(item)

            return (
              <div key={index} ref={index === items.length - 1 ? inViewRef : undefined}>
                {renderItem(item, index, isOptimistic)}
              </div>
            )
          })}

          {isLoading && items.length > 0 && renderLoading()}

          {error && renderError(error, loadMore)}

          {!hasMore && items.length > 0 && renderEndMessage()}
        </>,
      )}
    </div>
  )
}

