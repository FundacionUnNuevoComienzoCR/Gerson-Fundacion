import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export default function Skeleton({ className = "", variant = "rectangular" }: SkeletonProps) {
  const baseClass = "animate-pulse bg-gray-200 dark:bg-gray-800";
  
  const variantClasses = {
    text: "h-4 w-full rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-2xl"
  };

  return (
    <div 
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

// Highly customized composite skeletons for specific sections
export function ProgramSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Image Block */}
      <Skeleton className="h-48 w-full" variant="rectangular" />
      {/* Text Body */}
      <div className="p-6 space-y-4 flex-grow">
        <Skeleton className="h-6 w-2/3" variant="text" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" variant="text" />
          <Skeleton className="h-3.5 w-full" variant="text" />
          <Skeleton className="h-3.5 w-4/5" variant="text" />
        </div>
      </div>
    </div>
  );
}

export function GallerySkeleton() {
  return (
    <div className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 dark:bg-gray-950/20">
      <Skeleton className="w-full h-full" variant="rectangular" />
    </div>
  );
}

export function TestimonialSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150/40 dark:border-gray-850 p-8 rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-6">
      {/* Quote symbol skeleton */}
      <div className="flex justify-center">
        <Skeleton className="w-10 h-10" variant="circular" />
      </div>
      {/* Quotes text */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full mx-auto" variant="text" />
        <Skeleton className="h-4 w-11/12 mx-auto" variant="text" />
        <Skeleton className="h-4 w-9/12 mx-auto" variant="text" />
      </div>
      {/* Divider */}
      <Skeleton className="h-[1px] w-1/4 mx-auto" variant="text" />
      {/* Profile and Name */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="w-12 h-12" variant="circular" />
        <Skeleton className="h-4 w-32" variant="text" />
        <Skeleton className="h-3 w-24" variant="text" />
      </div>
    </div>
  );
}
