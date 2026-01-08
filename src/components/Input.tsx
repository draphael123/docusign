"use client";

import { forwardRef, ReactNode, useState } from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "filled" | "ghost";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = "left",
      variant = "default",
      className = "",
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const baseClasses =
      "w-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      default:
        "bg-[#12121a] border border-[#2a2a3a] text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
      filled:
        "bg-[#1f1f2e] border-transparent text-white placeholder-gray-500 focus:bg-[#2a2a3a] focus:ring-2 focus:ring-violet-500/20",
      ghost:
        "bg-transparent border-b border-[#2a2a3a] text-white placeholder-gray-500 focus:border-violet-500 rounded-none",
    };

    const sizeClasses = icon
      ? iconPosition === "left"
        ? "pl-11 pr-4 py-3 rounded-xl"
        : "pl-4 pr-11 py-3 rounded-xl"
      : "px-4 py-3 rounded-xl";

    const errorClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "";

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${errorClasses} ${className}`}
            {...props}
          />
          {icon && iconPosition === "right" && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

// Search Input
interface SearchInputProps extends Omit<InputProps, "icon" | "iconPosition"> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, value, ...props }, ref) => {
    const hasValue = value && String(value).length > 0;

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          ref={ref}
          type="text"
          value={value}
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#12121a] border border-[#2a2a3a] text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200"
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: "default" | "filled" | "ghost";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, variant = "default", className = "", ...props }, ref) => {
    const baseClasses =
      "w-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[120px]";

    const variantClasses = {
      default:
        "bg-[#12121a] border border-[#2a2a3a] text-white placeholder-gray-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 px-4 py-3 rounded-xl",
      filled:
        "bg-[#1f1f2e] border-transparent text-white placeholder-gray-500 focus:bg-[#2a2a3a] focus:ring-2 focus:ring-violet-500/20 px-4 py-3 rounded-xl",
      ghost:
        "bg-transparent border border-[#2a2a3a] text-white placeholder-gray-500 focus:border-violet-500 px-4 py-3 rounded-xl",
    };

    const errorClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      : "";

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl bg-[#12121a] border border-[#2a2a3a] text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200 cursor-pointer ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

