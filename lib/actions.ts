"use server"

import type { Post } from "./types"
import { cache } from "react"

// Simulated database of posts
const POSTS_PER_PAGE = 6
const TOTAL_POSTS = 100

// Cache the initial posts fetch to avoid redundant fetches
export const fetchInitialPosts = cache(async (): Promise<Post[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate mock posts for first page
  return generateMockPosts(1)
})

export async function fetchPosts(page: number): Promise<Post[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Generate mock posts for requested page
  return generateMockPosts(page)
}

// Helper function to generate consistent mock posts
function generateMockPosts(page: number): Post[] {
  // Calculate start and end indices for pagination
  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE

  // Check if we've reached the end of our data
  if (start >= TOTAL_POSTS) {
    return []
  }

  // Generate mock posts
  return Array.from({ length: Math.min(POSTS_PER_PAGE, TOTAL_POSTS - start) }, (_, i) => {
    const id = start + i + 1
    return {
      id: id.toString(),
      title: `Post ${id}: ${loremIpsum.slice(0, 50 + (id % 30))}`,
      excerpt: loremIpsum.slice(0, 150),
      content: loremIpsum,
      date: new Date(Date.now() - id * 86400000).toISOString(),
      imageUrl: `/placeholder.svg?height=400&width=600&text=Post+${id}`,
      author: {
        name: `Author ${(id % 5) + 1}`,
        avatar: `/placeholder.svg?height=100&width=100&text=A${(id % 5) + 1}`,
      },
    }
  })
}

// Lorem ipsum text for generating mock content
const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

