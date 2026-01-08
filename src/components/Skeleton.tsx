"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800";
  
  const variantClasses = {
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "skeleton-wave",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Skeleton for document cards
export function DocumentCardSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-gray-900/50 border border-gray-800 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton height={80} variant="rounded" />
      <div className="flex gap-2">
        <Skeleton width={80} height={32} variant="rounded" />
        <Skeleton width={80} height={32} variant="rounded" />
      </div>
    </div>
  );
}

// Skeleton for form sections
export function FormSectionSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-gray-900/50 border border-gray-800 space-y-4">
      <Skeleton width={120} height={20} />
      <Skeleton height={44} variant="rounded" />
    </div>
  );
}

// Skeleton for stats cards
export function StatsCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-center space-y-2">
      <Skeleton width={60} height={32} className="mx-auto" />
      <Skeleton width={80} height={14} className="mx-auto" />
    </div>
  );
}

// Skeleton for table rows
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-3 border-b border-gray-800">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width={`${100 / columns}%`} height={16} />
      ))}
    </div>
  );
}

// Skeleton for modal content
export function ModalSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton width={200} height={24} />
        <Skeleton width="100%" height={16} />
      </div>
      <div className="space-y-3">
        <FormSectionSkeleton />
        <FormSectionSkeleton />
      </div>
      <div className="flex gap-3">
        <Skeleton width={120} height={44} variant="rounded" />
        <Skeleton width={120} height={44} variant="rounded" />
      </div>
    </div>
  );
}

// Loading state wrapper
interface LoadingWrapperProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

export function LoadingWrapper({ isLoading, skeleton, children }: LoadingWrapperProps) {
  if (isLoading) return <>{skeleton}</>;
  return <>{children}</>;
}

export default Skeleton;

