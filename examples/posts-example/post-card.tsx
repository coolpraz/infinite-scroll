import type { Post } from "./types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface PostCardProps {
  post: Post
  isLoading?: boolean
}

export default function PostCard({ post, isLoading = false }: PostCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Image
            src={post.imageUrl || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <CardHeader className="flex-grow">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </>
        ) : (
          <>
            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
            <CardDescription>{formatDate(post.date)}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="relative h-8 w-8 rounded-full overflow-hidden">
              <Image
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm font-medium">{post.author.name}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

