import type { Product } from "./types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { StarIcon } from "lucide-react"

interface ProductCardProps {
  product: Product
  isLoading?: boolean
}

export default function ProductCard({ product, isLoading = false }: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full bg-gray-100">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}
      </div>
      <CardHeader className="pb-2">
        {isLoading ? (
          <Skeleton className="h-6 w-3/4 mb-2" />
        ) : (
          <CardTitle className="text-base line-clamp-1">{product.name}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : (
          <>
            <span className="font-bold">${product.price.toFixed(2)}</span>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

