"use client";

import { useState, useEffect } from "react";
import {
  X,
  Link2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  QrCode,
  Clock,
  Eye,
  Lock,
  Globe,
  Share2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

interface ShareDraftProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  bodyText: string;
  recipientName?: string;
}

interface ShareLink {
  id: string;
  url: string;
  createdAt: string;
  expiresAt?: string;
  views: number;
  isProtected: boolean;
}

export default function ShareDraft({
  isOpen,
  onClose,
  documentType,
  bodyText,
  recipientName,
}: ShareDraftProps) {
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [expiration, setExpiration] = useState<"1h" | "24h" | "7d" | "never">("24h");
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");

  const generateShareLink = async () => {
    setIsGenerating(true);

    // In a real app, this would call an API to create a share link
    // For demo purposes, we'll create a local share link
    const id = Math.random().toString(36).substring(2, 10);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    // Calculate expiration
    let expiresAt: string | undefined;
    const now = new Date();
    switch (expiration) {
      case "1h":
        expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
        break;
      case "24h":
        expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        break;
      case "7d":
        expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }

    // Store share data locally (in a real app, this would be stored on a server)
    const shareData = {
      id,
      documentType,
      bodyText,
      recipientName,
      createdAt: now.toISOString(),
      expiresAt,
      isProtected,
      password: isProtected ? password : undefined,
    };
    
    const existingShares = JSON.parse(localStorage.getItem("shareLinks") || "[]");
    existingShares.push(shareData);
    localStorage.setItem("shareLinks", JSON.stringify(existingShares));

    const link: ShareLink = {
      id,
      url: `${baseUrl}/share/${id}`,
      createdAt: now.toISOString(),
      expiresAt,
      views: 0,
      isProtected,
    };

    setTimeout(() => {
      setShareLink(link);
      setIsGenerating(false);
    }, 500);
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareViaEmail = () => {
    if (!shareLink) return;
    const subject = encodeURIComponent(`Document: ${documentType}`);
    const body = encodeURIComponent(`I'd like to share this document with you:\n\n${shareLink.url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const getExpirationText = () => {
    if (!shareLink?.expiresAt) return "Never expires";
    const expDate = new Date(shareLink.expiresAt);
    const now = new Date();
    const diff = expDate.getTime() - now.getTime();
    
    if (diff < 60 * 60 * 1000) {
      return `Expires in ${Math.round(diff / 60000)} minutes`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `Expires in ${Math.round(diff / 3600000)} hours`;
    } else {
      return `Expires in ${Math.round(diff / 86400000)} days`;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[--color-accent]/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-[--color-accent]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Share Draft</h2>
                <p className="text-sm text-[--text-muted]">Create a shareable link</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[--bg-elevated] text-[--text-muted] hover:text-[--text-primary] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!shareLink ? (
            <div className="space-y-4">
              {/* Document Preview */}
              <div className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-[--text-muted]" />
                  <span className="text-sm font-medium">{documentType}</span>
                </div>
                <p className="text-xs text-[--text-muted] line-clamp-2">
                  {bodyText.slice(0, 150)}...
                </p>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                  Link Expiration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "1h", label: "1 hour" },
                    { value: "24h", label: "24 hours" },
                    { value: "7d", label: "7 days" },
                    { value: "never", label: "Never" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExpiration(option.value as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        expiration === option.value
                          ? "bg-[--color-primary] text-white"
                          : "bg-[--bg-elevated] text-[--text-secondary] hover:bg-[--bg-overlay]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password Protection */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[--text-muted]" />
                  <div>
                    <span className="font-medium">Password Protection</span>
                    <p className="text-xs text-[--text-muted]">Require password to view</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProtected(!isProtected)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    isProtected ? "bg-[--color-primary]" : "bg-[--bg-overlay]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isProtected ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {isProtected && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary]"
                />
              )}

              {/* Generate Button */}
              <button
                onClick={generateShareLink}
                disabled={isGenerating || (isProtected && !password)}
                className="w-full px-4 py-3 rounded-xl bg-[--color-primary] text-white hover:bg-[--color-primary-hover] transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5" />
                    Generate Share Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Success */}
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[--color-success]/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-[--color-success]" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Link Created!</h3>
                <p className="text-sm text-[--text-muted]">{getExpirationText()}</p>
              </div>

              {/* Link Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink.url}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-3 rounded-xl transition-all ${
                    copied
                      ? "bg-[--color-success] text-white"
                      : "bg-[--bg-elevated] hover:bg-[--bg-overlay]"
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* QR Code Toggle */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:bg-[--bg-overlay] transition-colors"
              >
                <QrCode className="w-5 h-5" />
                {showQR ? "Hide QR Code" : "Show QR Code"}
              </button>

              {showQR && (
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <QRCodeSVG value={shareLink.url} size={180} />
                </div>
              )}

              {/* Share Options */}
              <div className="flex gap-2">
                <button
                  onClick={shareViaEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:bg-[--bg-overlay] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: documentType,
                        url: shareLink.url,
                      });
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:bg-[--bg-overlay] transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              {/* Info */}
              <div className="flex items-center gap-2 text-xs text-[--text-muted] justify-center">
                {shareLink.isProtected && (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Password protected
                  </span>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {shareLink.views} views
                </span>
              </div>

              {/* Create New Link */}
              <button
                onClick={() => setShareLink(null)}
                className="w-full text-center text-sm text-[--color-primary] hover:underline"
              >
                Create another link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
