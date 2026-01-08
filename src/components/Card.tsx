"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "elevated" | "outline";
  accent?: "violet" | "teal" | "gold" | "none";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

const accentColors = {
  violet: {
    border: "border-l-violet-500",
    glow: "hover:shadow-violet-500/10",
    gradient: "from-violet-500/10",
  },
  teal: {
    border: "border-l-teal-400",
    glow: "hover:shadow-teal-400/10",
    gradient: "from-teal-400/10",
  },
  gold: {
    border: "border-l-amber-400",
    glow: "hover:shadow-amber-400/10",
    gradient: "from-amber-400/10",
  },
  none: {
    border: "",
    glow: "",
    gradient: "",
  },
};

const paddingSizes = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className = "",
  variant = "default",
  accent = "none",
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  const baseClasses = "rounded-2xl transition-all duration-300";
  
  const variantClasses = {
    default: "bg-[#12121a]/90 backdrop-blur-sm border border-[#1f1f2e]",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10",
    elevated: "bg-[#16161f] border border-[#1f1f2e] shadow-xl shadow-black/20",
    outline: "bg-transparent border-2 border-[#2a2a3a]",
  };

  const accentClasses = accent !== "none" ? `border-l-4 ${accentColors[accent].border}` : "";
  const hoverClasses = hover ? `cursor-pointer hover:scale-[1.02] hover:shadow-2xl ${accentColors[accent].glow}` : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingSizes[padding]} ${accentClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Card Header
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  accent?: "violet" | "teal" | "gold";
}

export function CardHeader({ title, subtitle, icon, action, accent = "violet" }: CardHeaderProps) {
  const accentTextColors = {
    violet: "text-violet-400",
    teal: "text-teal-400",
    gold: "text-amber-400",
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColors[accent].gradient} to-transparent flex items-center justify-center ${accentTextColors[accent]}`}>
            {icon}
          </div>
        )}
        <div>
          <h3 className={`font-medium ${accentTextColors[accent]}`}>{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Card Body
interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

// Card Footer
interface CardFooterProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right" | "between";
}

export function CardFooter({ children, className = "", align = "right" }: CardFooterProps) {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-[#1f1f2e] ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}

// Stats Card
interface StatsCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: { value: number; isPositive: boolean };
  accent?: "violet" | "teal" | "gold";
}

export function StatsCard({ value, label, icon, trend, accent = "violet" }: StatsCardProps) {
  const accentTextColors = {
    violet: "text-violet-400",
    teal: "text-teal-400",
    gold: "text-amber-400",
  };

  return (
    <Card variant="glass" padding="md" className="text-center">
      {icon && (
        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${accentColors[accent].gradient} to-transparent flex items-center justify-center ${accentTextColors[accent]}`}>
          {icon}
        </div>
      )}
      <div className={`text-3xl font-bold ${accentTextColors[accent]}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
      {trend && (
        <div className={`text-xs mt-2 ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
        </div>
      )}
    </Card>
  );
}

