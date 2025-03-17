"use client"

import { useInfiniteScroll } from "@/lib/infinite-scroll"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SimpleItem {
  id: string
  title: string
  content: string
}

// Simple example with minimal configuration
export default function SimpleExamplePage() {
  const { items, hasMore, isLoading, error, loadMore, inViewRef, isOptimisticItem } = useInfiniteScroll<SimpleItem>({
    fetchData: async (page) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Return 10 items per page, up to 50 items total
      if (page > 5) return []

      return Array.from({ length: 10 }, (_, i) => ({
        id: `item-${page}-${i}`,
        title: `Item ${(page - 1) * 10 + i + 1}`,
        content: `This is the content for item ${(page - 1) * 10 + i + 1}. It contains some sample text.`,
      }))
    },
    optimisticUpdates: true,
    createPlaceholder: () => ({
      id: `optimistic-${Date.now()}-${Math.random()}`,
      title: "Loading...",
      content: "Loading content...",
    }),
    // Increase the rootMargin to load earlier
    rootMargin: "100px",
  })

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Simple Infinite Scroll Example</h1>

      <div className="space-y-4 max-w-2xl mx-auto">
        {items.map((item, index) => {
          const isOptimistic = isOptimisticItem(item)

          return (
            <div key={item.id} ref={index === items.length - 1 ? inViewRef : undefined}>
              <Card>
                <CardHeader>
                  {isOptimistic ? <Skeleton className="h-6 w-1/3" /> : <CardTitle>{item.title}</CardTitle>}
                </CardHeader>
                <CardContent>
                  {isOptimistic ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <p>{item.content}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )
        })}

        {isLoading && items.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-center">Loading more items...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
            <button
              onClick={loadMore}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!hasMore && items.length > 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>No more items to load</p>
          </div>
        )}
      </div>
    </main>
  )
}

