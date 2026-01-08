"use client";

import { ReactNode, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      loading = false,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a12] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-violet-500 to-teal-400 text-white hover:from-violet-600 hover:to-teal-500 focus:ring-violet-500 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5",
      secondary:
        "bg-[#1f1f2e] text-white hover:bg-[#2a2a3a] focus:ring-gray-500 border border-[#2a2a3a] hover:border-[#3a3a4a]",
      ghost:
        "bg-transparent text-gray-300 hover:bg-white/10 hover:text-white focus:ring-gray-500",
      outline:
        "bg-transparent text-violet-400 border-2 border-violet-500/50 hover:bg-violet-500/10 hover:border-violet-500 focus:ring-violet-500",
      danger:
        "bg-red-500/10 text-red-400 hover:bg-red-500/20 focus:ring-red-500 border border-red-500/30 hover:border-red-500/50",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
      md: "px-4 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-6 py-3 text-base rounded-xl gap-2.5",
    };

    const widthClass = fullWidth ? "w-full" : "";

    const iconElement = loading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      icon
    );

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {iconElement && iconPosition === "left" && <span>{iconElement}</span>}
        {children}
        {iconElement && iconPosition === "right" && <span>{iconElement}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

// Icon Button (circular)
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  tooltip?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = "ghost", size = "md", tooltip, className = "", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a12] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-violet-500 to-teal-400 text-white hover:from-violet-600 hover:to-teal-500 focus:ring-violet-500 shadow-lg shadow-violet-500/25",
      secondary:
        "bg-[#1f1f2e] text-gray-300 hover:bg-[#2a2a3a] hover:text-white focus:ring-gray-500 border border-[#2a2a3a]",
      ghost:
        "bg-transparent text-gray-400 hover:bg-white/10 hover:text-white focus:ring-gray-500",
      outline:
        "bg-transparent text-violet-400 border-2 border-violet-500/50 hover:bg-violet-500/10 hover:border-violet-500 focus:ring-violet-500",
    };

    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };

    const iconSizeClasses = {
      sm: "[&>svg]:w-4 [&>svg]:h-4",
      md: "[&>svg]:w-5 [&>svg]:h-5",
      lg: "[&>svg]:w-6 [&>svg]:h-6",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${iconSizeClasses[size]} ${className}`}
        title={tooltip}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

// Button Group
interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className = "" }: ButtonGroupProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

