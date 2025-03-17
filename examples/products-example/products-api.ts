import type { Product } from "./types"

// Simulated API for products
const PRODUCTS_PER_PAGE = 8
const TOTAL_PRODUCTS = 80

export async function fetchProducts(page: number): Promise<Product[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Calculate start and end indices for pagination
  const start = (page - 1) * PRODUCTS_PER_PAGE
  const end = start + PRODUCTS_PER_PAGE

  // Check if we've reached the end of our data
  if (start >= TOTAL_PRODUCTS) {
    return []
  }

  // Generate mock products
  return Array.from({ length: Math.min(PRODUCTS_PER_PAGE, TOTAL_PRODUCTS - start) }, (_, i) => {
    const id = start + i + 1
    const categories = ["electronics", "clothing", "home", "books", "toys"]
    const category = categories[id % categories.length]

    return {
      id: id.toString(),
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Product ${id}`,
      description: `This is a great ${category} product with amazing features and benefits. You'll love it!`,
      price: 19.99 + (id % 10) * 10,
      imageUrl: `/placeholder.svg?height=200&width=200&text=${category}+${id}`,
      rating: 3 + (id % 3),
      category,
    }
  })
}

