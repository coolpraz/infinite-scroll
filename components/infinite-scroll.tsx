"use client"

import { use, useEffect, useState, useRef, useCallback, useOptimistic } from "react"
import { fetchPosts, fetchInitialPosts } from "@/lib/actions"
import type { Post } from "@/lib/types"
import PostCard from "@/components/post-card"
import { Loader2 } from "lucide-react"

export default function InfiniteScroll() {
  // Use React 19's `use` hook to unwrap the Promise from the server
  const initialPostsPromise = fetchInitialPosts()
  const initialPosts = use(initialPostsPromise)

  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [optimisticPosts, addOptimisticPosts] = useOptimistic(posts, (state, newPosts: Post[]) => [
    ...state,
    ...newPosts,
  ])
  const [page, setPage] = useState(2) // Start at page 2 since we already loaded page 1
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastPostRef = useRef<HTMLDivElement | null>(null)

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    // Create optimistic UI updates with placeholder posts
    const optimisticPlaceholders = Array.from({ length: 6 }, (_, i) => ({
      id: `optimistic-${Date.now()}-${i}`,
      title: "Loading...",
      excerpt: "Loading content...",
      content: "",
      date: new Date().toISOString(),
      imageUrl: "/placeholder.svg",
      author: {
        name: "Loading...",
        avatar: "/placeholder.svg",
      },
    }))

    // Add optimistic posts to the UI
    addOptimisticPosts(optimisticPlaceholders)

    try {
      const newPosts = await fetchPosts(page)

      if (newPosts.length === 0) {
        setHasMore(false)
        // Remove optimistic placeholders if no new posts
        setPosts((posts) => posts.filter((post) => !post.id.startsWith("optimistic-")))
      } else {
        // Replace optimistic placeholders with real data
        setPosts((posts) => [...posts.filter((post) => !post.id.startsWith("optimistic-")), ...newPosts])
        setPage((prevPage) => prevPage + 1)
      }
    } catch (err) {
      setError("Failed to load posts. Please try again.")
      // Remove optimistic placeholders on error
      setPosts((posts) => posts.filter((post) => !post.id.startsWith("optimistic-")))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [page, isLoading, hasMore, addOptimisticPosts, posts])

  // Set up intersection observer
  useEffect(() => {
    if (isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts()
        }
      },
      { threshold: 0.1 },
    )

    observerRef.current = observer

    if (lastPostRef.current) {
      observer.observe(lastPostRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isLoading, hasMore, loadMorePosts])

  return (
    <div className="space-y-8">
      {optimisticPosts.length === 0 && isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimisticPosts.map((post, index) => {
              const isOptimistic = post.id.startsWith("optimistic-")

              if (index === optimisticPosts.length - 1) {
                return (
                  <div key={post.id} ref={lastPostRef}>
                    <PostCard post={post} isLoading={isOptimistic} />
                  </div>
                )
              }
              return <PostCard key={post.id} post={post} isLoading={isOptimistic} />
            })}
          </div>

          {isLoading && !optimisticPosts.some((p) => p.id.startsWith("optimistic-")) && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-4 text-red-500">
              <p>{error}</p>
              <button
                onClick={loadMorePosts}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!hasMore && optimisticPosts.length > 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No more posts to load</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

