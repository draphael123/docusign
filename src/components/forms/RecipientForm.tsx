"use client";

import { useState } from "react";
import { useDocumentStore, SavedRecipient } from "@/store/documentStore";
import { BookUser, Plus, Trash2, User, Briefcase, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";

interface RecipientFormProps {
  theme?: "dark" | "light";
}

export default function RecipientForm({ theme = "dark" }: RecipientFormProps) {
  const [showAddressBook, setShowAddressBook] = useState(false);

  const {
    recipient,
    setRecipient,
    subject,
    setSubject,
    savedRecipients,
    addSavedRecipient,
    removeSavedRecipient,
  } = useDocumentStore();

  const bgElevated = theme === "light" ? "bg-[#f5f2ed]" : "bg-[--bg-elevated]";
  const borderColor = theme === "light" ? "border-[#e5e0d8]" : "border-[--border-default]";
  const textMuted = theme === "light" ? "text-[#8f897f]" : "text-[--text-muted]";

  const handleSaveRecipient = () => {
    if (!recipient.name.trim()) {
      toast.error("Enter a recipient name first");
      return;
    }
    const newRecipient: SavedRecipient = {
      id: `recipient-${Date.now()}`,
      name: recipient.name,
      title: recipient.title,
      address: recipient.address,
    };
    addSavedRecipient(newRecipient);
    toast.success("Recipient saved to address book");
  };

  const handleLoadRecipient = (saved: SavedRecipient) => {
    setRecipient({
      name: saved.name,
      title: saved.title,
      address: saved.address,
    });
    setShowAddressBook(false);
    toast.success(`Loaded: ${saved.name}`);
  };

  return (
    <>
      <section className="form-section card p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-label flex items-center gap-2">
            <User className="w-4 h-4 text-[--color-accent]" />
            Recipient Details
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddressBook(true)}
              className={`text-xs px-3 py-1.5 ${bgElevated} border ${borderColor} rounded-lg hover:border-[--color-accent] hover:text-[--color-accent] transition-all ${textMuted} flex items-center gap-1.5`}
            >
              <BookUser className="w-3.5 h-3.5" />
              Address Book ({savedRecipients.length})
            </button>
            {recipient.name && (
              <button
                onClick={handleSaveRecipient}
                className="text-xs px-3 py-1.5 bg-[--color-accent] text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Save
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="recipientName" className={`block text-sm ${textMuted} mb-1.5`}>
              Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <input
                type="text"
                id="recipientName"
                value={recipient.name}
                onChange={(e) => setRecipient({ name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg"
                placeholder="John Smith"
              />
            </div>
          </div>

          <div>
            <label htmlFor="recipientTitle" className={`block text-sm ${textMuted} mb-1.5`}>
              Title
            </label>
            <div className="relative">
              <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <input
                type="text"
                id="recipientTitle"
                value={recipient.title}
                onChange={(e) => setRecipient({ title: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg"
                placeholder="HR Manager"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="recipientAddress" className={`block text-sm ${textMuted} mb-1.5`}>
              Address
            </label>
            <div className="relative">
              <MapPin className={`absolute left-3 top-3 w-4 h-4 ${textMuted}`} />
              <textarea
                id="recipientAddress"
                value={recipient.address}
                onChange={(e) => setRecipient({ address: e.target.value })}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg resize-none"
                placeholder="123 Business Ave, City, State 12345"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="subject" className={`block text-sm ${textMuted} mb-1.5`}>
              Subject Line
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg"
              placeholder="Re: Letter of Recommendation for..."
            />
          </div>
        </div>
      </section>

      {/* Address Book Modal */}
      {showAddressBook && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddressBook(false)}
        >
          <div
            className="card max-w-md w-full rounded-2xl overflow-hidden modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[--border-default]">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookUser className="w-5 h-5 text-[--color-accent]" />
                Address Book
              </h2>
              <button
                onClick={() => setShowAddressBook(false)}
                className="text-[--text-muted] hover:text-[--text-primary] text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-auto">
              {savedRecipients.length === 0 ? (
                <div className="text-center py-12">
                  <BookUser className="w-12 h-12 mx-auto mb-4 text-[--text-muted] opacity-50" />
                  <p className="text-[--text-muted]">No saved recipients yet.</p>
                  <p className="text-sm text-[--text-muted] mt-1">
                    Fill in recipient details and click &quot;Save&quot; to add one.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedRecipients.map((r) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl ${bgElevated} border ${borderColor} flex items-center justify-between hover:border-[--color-accent] transition-all cursor-pointer group`}
                      onClick={() => handleLoadRecipient(r)}
                    >
                      <div className="flex-1">
                        <div className="font-medium group-hover:text-[--color-accent] transition-colors">
                          {r.name}
                        </div>
                        {r.title && (
                          <div className={`text-sm ${textMuted}`}>{r.title}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSavedRecipient(r.id);
                          toast.success("Recipient removed");
                        }}
                        className={`${textMuted} hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

