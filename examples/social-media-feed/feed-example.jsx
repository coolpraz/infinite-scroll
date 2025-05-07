"use client"

import { useState } from "react"
import { useInfiniteScroll, useOptimisticActions, InfiniteScroll } from "../../src"

// Simulated API calls
const fetchPosts = async (page) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Return 5 posts per page for demo purposes
  const startIndex = (page - 1) * 5
  return Array.from({ length: 5 }, (_, i) => ({
    id: startIndex + i + 1,
    author: `User ${Math.floor(Math.random() * 100)}`,
    content: `This is post #${startIndex + i + 1} with some random content.`,
    likes: Math.floor(Math.random() * 100),
    comments: [],
    timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  }))
}

const addComment = async (postId, comment) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    id: Math.floor(Math.random() * 10000),
    author: "You",
    content: comment,
    timestamp: new Date().toISOString(),
  }
}

const createPost = async (content) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    id: Math.floor(Math.random() * 10000) + 1000,
    author: "You",
    content: content,
    likes: 0,
    comments: [],
    timestamp: new Date().toISOString(),
  }
}

// Define optimistic action handlers
const postActionHandler = (state, action) => {
  switch (action.type) {
    case "ADD_COMMENT":
      return state.map((post) => {
        if (post.id === action.postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `temp-${Date.now()}`,
                author: "You",
                content: action.content,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        }
        return post
      })

    case "LIKE_POST":
      return state.map((post) => {
        if (post.id === action.postId) {
          return { ...post, likes: post.likes + 1 }
        }
        return post
      })

    case "CREATE_POST":
      return [
        {
          id: `temp-${Date.now()}`,
          author: "You",
          content: action.content,
          likes: 0,
          comments: [],
          timestamp: new Date().toISOString(),
        },
        ...state,
      ]

    default:
      return state
  }
}

export default function SocialMediaFeed() {
  const [newPostContent, setNewPostContent] = useState("")
  const [commentInputs, setCommentInputs] = useState({})

  const scrollResult = useInfiniteScroll({
    fetchItems: fetchPosts,
    initialPage: 1,
  })

  const [optimisticPosts, addOptimisticAction] = useOptimisticActions(scrollResult.items, postActionHandler)

  const handleCommentSubmit = async (postId) => {
    const content = commentInputs[postId]?.trim()
    if (!content) return

    // Apply optimistic update
    addOptimisticAction({ type: "ADD_COMMENT", postId, content })

    // Reset input
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }))

    // Make API call
    try {
      const newComment = await addComment(postId, content)

      // Update the actual state with the server response
      const updatedPosts = scrollResult.items.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          }
        }
        return post
      })

      scrollResult.setItems(updatedPosts)
    } catch (error) {
      console.error("Failed to add comment:", error)
      // You might want to show an error to the user and revert the optimistic update
    }
  }

  const handleCreatePost = async () => {
    const content = newPostContent.trim()
    if (!content) return

    // Apply optimistic update
    addOptimisticAction({ type: "CREATE_POST", content })

    // Reset input
    setNewPostContent("")

    // Make API call
    try {
      const newPost = await createPost(content)

      // Update the actual state with the server response
      scrollResult.setItems([newPost, ...scrollResult.items])
    } catch (error) {
      console.error("Failed to create post:", error)
      // You might want to show an error to the user and revert the optimistic update
    }
  }

  return (
    <div className="social-feed-container">
      <h1>Social Media Feed</h1>

      {/* Create new post */}
      <div className="new-post-form">
        <textarea
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          rows={3}
        />
        <button onClick={handleCreatePost}>Post</button>
      </div>

      <InfiniteScroll
        scrollResult={scrollResult}
        className="post-list"
        renderItem={(post, index, ref) => (
          <div key={post.id} className="post" ref={ref}>
            <div className="post-header">
              <span className="post-author">{post.author}</span>
              <span className="post-time">{new Date(post.timestamp).toLocaleString()}</span>
            </div>

            <div className="post-content">{post.content}</div>

            <div className="post-actions">
              <button
                onClick={() => {
                  addOptimisticAction({ type: "LIKE_POST", postId: post.id })
                }}
              >
                👍 {post.likes}
              </button>
            </div>

            <div className="post-comments">
              {post.comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-content">{comment.content}</span>
                </div>
              ))}
            </div>

            <div className="add-comment">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInputs[post.id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCommentSubmit(post.id)
                  }
                }}
              />
              <button onClick={() => handleCommentSubmit(post.id)}>Send</button>
            </div>
          </div>
        )}
        loadingComponent={<div className="loading">Loading more posts...</div>}
        emptyComponent={<div className="empty">No posts found</div>}
        endComponent={<div className="end">No more posts to load</div>}
      />
    </div>
  )
}
