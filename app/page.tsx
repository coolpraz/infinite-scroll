import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Infinite Scroll Library</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Posts Example</CardTitle>
            <CardDescription>Blog posts with images and author info</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Demonstrates infinite scrolling with blog posts, including optimistic UI updates and skeleton loading
              states.
            </p>
            <Link
              href="/examples/posts-example"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              View Example
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Products Example</CardTitle>
            <CardDescription>E-commerce product grid with manual loading</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Shows a product grid with manual "Load More" button instead of automatic loading on scroll.
            </p>
            <Link
              href="/examples/products-example"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              View Example
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Simple Example</CardTitle>
            <CardDescription>Minimal configuration example</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">A basic example with minimal configuration to demonstrate core functionality.</p>
            <Link
              href="/examples/simple-example"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              View Example
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

