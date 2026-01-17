"use client";

import { useDocumentStore } from "@/store/documentStore";
import { signatories } from "@/data/signatories";
import { PenLine, Building2, Phone, Mail, User, Briefcase } from "lucide-react";

interface SignatorySectionProps {
  theme?: "dark" | "light";
}

export default function SignatorySection({ theme = "dark" }: SignatorySectionProps) {
  const {
    selectedSignatoryId,
    useCustomSignatory,
    customSignatory,
    setSelectedSignatory,
    setUseCustomSignatory,
    setCustomSignatory,
  } = useDocumentStore();

  const bgElevated = theme === "light" ? "bg-[#f5f2ed]" : "bg-[--bg-elevated]";
  const borderColor = theme === "light" ? "border-[#e5e0d8]" : "border-[--border-default]";
  const textMuted = theme === "light" ? "text-[#8f897f]" : "text-[--text-muted]";

  return (
    <section className="form-section card p-5 rounded-xl">
      <h2 className="section-label mb-4 flex items-center gap-2">
        <PenLine className="w-4 h-4 text-[--color-primary]" />
        Signatory
      </h2>

      <div className="space-y-2">
        {signatories.map((signatory) => {
          const isSelected = !useCustomSignatory && selectedSignatoryId === signatory.id;
          return (
            <label
              key={signatory.id}
              className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border ${
                isSelected
                  ? `${bgElevated} border-[--color-primary] shadow-lg shadow-[--color-primary]/10`
                  : `${bgElevated} ${borderColor} hover:border-[--color-primary]/50`
              }`}
            >
              <input
                type="radio"
                name="signatory"
                value={signatory.id}
                checked={isSelected}
                onChange={() => setSelectedSignatory(signatory.id)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                  isSelected ? "border-[--color-primary]" : "border-[--text-muted]"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[--color-primary]" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{signatory.name}</div>
                <div className={`text-sm ${textMuted}`}>{signatory.title}</div>
              </div>
              {signatory.company && (
                <div className={`text-xs ${textMuted} hidden sm:block`}>
                  {signatory.company}
                </div>
              )}
            </label>
          );
        })}

        {/* Custom Signatory */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            useCustomSignatory
              ? `${bgElevated} border-[--color-primary] shadow-lg shadow-[--color-primary]/10`
              : `${bgElevated} ${borderColor}`
          }`}
        >
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="signatory"
              checked={useCustomSignatory}
              onChange={() => setUseCustomSignatory(true)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                useCustomSignatory ? "border-[--color-primary]" : "border-[--text-muted]"
              }`}
            >
              {useCustomSignatory && (
                <div className="w-2.5 h-2.5 rounded-full bg-[--color-primary]" />
              )}
            </div>
            <span className="font-medium">Custom Signatory</span>
          </label>

          {useCustomSignatory && (
            <div className="mt-5 space-y-4 pl-9 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="text"
                    value={customSignatory.name}
                    onChange={(e) => setCustomSignatory({ name: e.target.value })}
                    placeholder="Full Name *"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm"
                  />
                </div>
                <div className="relative">
                  <Briefcase className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="text"
                    value={customSignatory.title}
                    onChange={(e) => setCustomSignatory({ title: e.target.value })}
                    placeholder="Title"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <Building2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <input
                  type="text"
                  value={customSignatory.company}
                  onChange={(e) => setCustomSignatory({ company: e.target.value })}
                  placeholder="Company"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="text"
                    value={customSignatory.phone}
                    onChange={(e) => setCustomSignatory({ phone: e.target.value })}
                    placeholder="Phone"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm"
                  />
                </div>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="email"
                    value={customSignatory.email}
                    onChange={(e) => setCustomSignatory({ email: e.target.value })}
                    placeholder="Email"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

