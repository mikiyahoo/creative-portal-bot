"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-tg-secondary rounded ${className}`}
      style={{
        background: "linear-gradient(90deg, var(--tg-theme-secondary-bg-color) 25%, rgba(255,255,255,0.1) 50%, var(--tg-theme-secondary-bg-color) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-tg-secondary/50 backdrop-blur-md rounded-xl p-4 border border-white/10">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function JobFeedSkeleton() {
  return (
    <div className="space-y-3">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  );
}