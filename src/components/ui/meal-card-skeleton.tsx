import { Card, CardContent } from "./card"
import { Skeleton } from "./skeleton"
import { cn } from "~/lib/utils"

interface MealCardSkeletonProps {
  className?: string
}

export function MealCardSkeleton({ className }: MealCardSkeletonProps) {
  return (
    <Card className={cn(
      "overflow-hidden border-0 shadow-sm bg-white rounded-3xl",
      className
    )}>
      <CardContent className="p-2">
        {/* Image Skeleton */}
        <Skeleton className="aspect-square bg-muted rounded-2xl mb-4" />
        
        {/* Content Skeleton */}
        <div className="px-4 pb-4 space-y-3">
          <div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />
          </div>
          
          {/* Tags Skeleton */}
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          
          {/* Price and Button Skeleton */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <Skeleton className="h-6 w-20 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
            
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MealCardSkeletonGridProps {
  count?: number
  className?: string
}

export function MealCardSkeletonGrid({ count = 6, className }: MealCardSkeletonGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <MealCardSkeleton key={i} />
      ))}
    </div>
  )
}
