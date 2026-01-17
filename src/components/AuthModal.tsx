"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultTab?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = "login",
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
  };

  const handleTabChange = (newTab: "login" | "signup") => {
    setTab(newTab);
    resetForm();
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (tab === "signup" && !name.trim()) {
      setError("Name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        name: tab === "signup" ? name : undefined,
        action: tab,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        toast.success(tab === "login" ? "Welcome back!" : "Account created successfully!");
        onSuccess?.();
        onClose();
        resetForm();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--text-primary] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-[--bg-elevated] rounded-xl mb-6">
            <button
              onClick={() => handleTabChange("login")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                tab === "login"
                  ? "bg-[--color-primary] text-white shadow-lg"
                  : "text-[--text-muted] hover:text-[--text-primary]"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => handleTabChange("signup")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                tab === "signup"
                  ? "bg-[--color-primary] text-white shadow-lg"
                  : "text-[--text-muted] hover:text-[--text-primary]"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              {tab === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-[--text-muted] mt-1">
              {tab === "login"
                ? "Sign in to access your templates"
                : "Sign up to save and sync your templates"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Name Field (Signup only) */}
          {tab === "signup" && (
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-primary]"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {tab === "signup" && (
              <p className="text-xs text-[--text-muted] mt-1">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {tab === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>
                {tab === "login" ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </>
            )}
          </button>

          {/* Features List */}
          <div className="mt-6 pt-6 border-t border-[--border-default]">
            <p className="text-xs text-[--text-muted] text-center mb-3">
              {tab === "signup" ? "What you get with an account:" : "Sign in to access:"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Save templates",
                "Sync across devices",
                "Share templates",
                "Template history",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-1.5 text-[--text-secondary]"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[--color-success]" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

