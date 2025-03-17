"use client"

import { useInfiniteScroll } from "@/lib/infinite-scroll"
import { fetchProducts } from "./products-api"
import ProductCard from "./product-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { Product } from "./types"

export default function ProductsExample() {
  const {
    items: products,
    hasMore,
    isLoading,
    error,
    loadMore,
    inViewRef,
    isOptimisticItem,
  } = useInfiniteScroll<Product>({
    fetchData: fetchProducts,
    pageSize: 8,
    threshold: 0, // Disable automatic loading
    getItemId: (product) => product.id,
    optimisticUpdates: true,
    createPlaceholder: (index) => ({
      id: `optimistic-${Date.now()}-${index}`,
      name: "Loading...",
      description: "Loading product description...",
      price: 0,
      imageUrl: "/placeholder.svg",
      rating: 0,
      category: "loading",
    }),
  })

  // Manual load more button example instead of automatic loading
  const handleLoadMore = () => {
    loadMore()
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, index) => {
          const isOptimistic = isOptimisticItem(product)

          // Only the sentinel element gets the inViewRef
          return (
            <div key={product.id} ref={index === products.length - 1 ? inViewRef : undefined}>
              <ProductCard product={product} isLoading={isOptimistic} />
            </div>
          )
        })}
      </div>

      {error && (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
          <Button onClick={handleLoadMore} className="mt-2" variant="destructive">
            Retry
          </Button>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button onClick={handleLoadMore} disabled={isLoading} className="min-w-[150px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <p>You've reached the end of the catalog</p>
        </div>
      )}
    </div>
  )
}

