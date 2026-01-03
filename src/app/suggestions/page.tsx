"use client";

import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

export default function SuggestionsPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !suggestion.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          suggestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit suggestion");
      }

      toast.success("Thank you! Your suggestion has been submitted successfully.");
      setName("");
      setEmail("");
      setSuggestion("");
    } catch (error: any) {
      console.error("Error submitting suggestion:", error);
      toast.error(error.message || "Error submitting suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-white/20">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                ← Back to Document Generator
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Suggestions & Feedback
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                We'd love to hear your thoughts! Share your suggestions, report issues, or request new features.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium text-gray-800 hover:border-blue-300"
                  placeholder="Enter your name"
                />
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium text-gray-800 hover:border-green-300"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <label
                  htmlFor="suggestion"
                  className="block text-sm font-semibold text-gray-800 mb-2"
                >
                  Your Suggestion or Feedback
                </label>
                <textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  required
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium text-gray-800 hover:border-purple-300 resize-y"
                  placeholder="Tell us what you think! Share your suggestions, report bugs, or request new features..."
                />
                <div className="mt-2 text-xs text-gray-600">
                  {suggestion.length} characters
                </div>
              </div>

              <div className="flex gap-4">
                <Link
                  href="/"
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

