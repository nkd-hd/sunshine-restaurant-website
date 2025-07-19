import { cn } from "~/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-16 w-16"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  )
}
