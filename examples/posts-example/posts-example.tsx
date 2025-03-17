"use client"

import { use } from "react"
import { InfiniteScroll } from "@/lib/infinite-scroll"
import { fetchInitialPosts, fetchPosts } from "./posts-actions"
import PostCard from "./post-card"

export default function PostsExample() {
  // Use React 19's `use` hook to unwrap the Promise from the server
  const initialPostsPromise = fetchInitialPosts()
  const initialPosts = use(initialPostsPromise)

  return (
    <InfiniteScroll
      initialData={initialPosts}
      options={{
        fetchData: fetchPosts,
        pageSize: 6,
        initialPage: 2, // Start at page 2 since we already loaded page 1
        threshold: 0.1,
        rootMargin: "200px",
        getItemId: (post) => post.id,
        optimisticUpdates: true,
        createPlaceholder: (index) => ({
          id: `optimistic-${Date.now()}-${index}`,
          title: "Loading...",
          excerpt: "Loading content...",
          content: "",
          date: new Date().toISOString(),
          imageUrl: "/placeholder.svg",
          author: {
            name: "Loading...",
            avatar: "/placeholder.svg",
          },
        }),
      }}
      renderItem={(post, _, isOptimistic) => <PostCard post={post} isLoading={isOptimistic} />}
      renderContainer={(children) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
      )}
    />
  )
}

