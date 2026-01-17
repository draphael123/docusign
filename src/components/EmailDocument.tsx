"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Send,
  Paperclip,
  User,
  FileText,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface EmailDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  bodyText: string;
  recipientName?: string;
  onGeneratePDF: () => Promise<Blob>;
}

export default function EmailDocument({
  isOpen,
  onClose,
  documentType,
  bodyText,
  recipientName,
  onGeneratePDF,
}: EmailDocumentProps) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(`Document: ${documentType}`);
  const [message, setMessage] = useState(
    `Hi${recipientName ? ` ${recipientName}` : ""},\n\nPlease find the attached document.\n\nBest regards`
  );
  const [attachPDF, setAttachPDF] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSend = async () => {
    // Validate
    if (!to.trim()) {
      toast.error("Please enter a recipient email");
      return;
    }

    const emails = to.split(",").map((e) => e.trim());
    const invalidEmails = emails.filter((e) => !validateEmail(e));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email: ${invalidEmails[0]}`);
      return;
    }

    setIsSending(true);

    try {
      // Generate PDF if attaching
      let pdfBlob: Blob | null = null;
      if (attachPDF) {
        pdfBlob = await onGeneratePDF();
      }

      // In a real app, this would send via an API
      // For demo, we'll use mailto with the message
      // (PDF attachment requires server-side implementation)

      if (pdfBlob && typeof window !== "undefined") {
        // Create download link for PDF
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${documentType.replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // Open email client
      const mailtoUrl = `mailto:${to}${cc ? `?cc=${cc}` : ""}${cc ? "&" : "?"}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message + "\n\n[PDF document downloaded separately]")}`;
      window.open(mailtoUrl);

      toast.success("Email client opened! PDF downloaded for attachment.");
      onClose();
    } catch (error) {
      console.error("Error sending:", error);
      toast.error("Failed to prepare email");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[--bg-surface] rounded-2xl shadow-2xl border border-[--border-default] overflow-hidden modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Email Document</h2>
                <p className="text-sm text-[--text-muted]">Send via email client</p>
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

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* To */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              To *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--text-muted]" />
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@email.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary]"
              />
            </div>
            <p className="text-xs text-[--text-muted] mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          {/* CC Toggle */}
          {!showCc ? (
            <button
              onClick={() => setShowCc(true)}
              className="text-sm text-[--color-primary] hover:underline"
            >
              + Add CC
            </button>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[--text-secondary] mb-2">
                CC
              </label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@email.com"
                className="w-full px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary]"
              />
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-[--text-secondary] mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] focus:border-[--color-primary] resize-none"
            />
          </div>

          {/* Attach PDF */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
            <div className="flex items-center gap-3">
              <Paperclip className="w-5 h-5 text-[--text-muted]" />
              <div>
                <span className="font-medium">Attach PDF</span>
                <p className="text-xs text-[--text-muted]">
                  Download PDF to attach manually
                </p>
              </div>
            </div>
            <button
              onClick={() => setAttachPDF(!attachPDF)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                attachPDF ? "bg-[--color-primary]" : "bg-[--bg-overlay]"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  attachPDF ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Document Preview */}
          <div className="p-4 rounded-xl bg-[--bg-elevated] border border-[--border-default]">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[--color-primary]" />
              <span className="text-sm font-medium">{documentType}</span>
            </div>
            <p className="text-xs text-[--text-muted] line-clamp-2">
              {bodyText.slice(0, 150)}...
            </p>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 text-xs text-[--text-muted] p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              This will open your default email client. The PDF will be downloaded
              separately for you to attach.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[--border-default] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[--bg-elevated] border border-[--border-default] hover:bg-[--bg-overlay] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !to.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
