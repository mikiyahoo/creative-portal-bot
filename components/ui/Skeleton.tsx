"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl p-6 border border-gray-100">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-3">
        <Skeleton className="h-12 w-1/2 rounded-xl" />
        <Skeleton className="h-12 w-1/2 rounded-xl" />
      </div>
    </div>
  );
}

export function JobFeedSkeleton() {
  return (
    <div className="space-y-4">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  );
}