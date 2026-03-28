import { Skeleton } from "@/components/ui/skeleton";

export default function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
          {/* Image skeleton */}
          <Skeleton className="w-full h-48 rounded-lg" />
          
          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4 mt-4" />
          
          {/* Description skeleton */}
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-2/3 mt-1" />
          
          {/* Price and button skeleton */}
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
