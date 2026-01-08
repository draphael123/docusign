"use client";

interface ProgressIndicatorProps {
  bodyText: string;
  recipientName: string;
  signatorySelected: boolean;
  documentType: string;
  compact?: boolean;
}

interface CheckItem {
  label: string;
  completed: boolean;
  weight: number;
}

export default function ProgressIndicator({ 
  bodyText, 
  recipientName, 
  signatorySelected, 
  documentType,
  compact = false 
}: ProgressIndicatorProps) {
  const wordCount = bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0;
  
  const checks: CheckItem[] = [
    { label: "Document type selected", completed: !!documentType, weight: 10 },
    { label: "Content added (50+ words)", completed: wordCount >= 50, weight: 40 },
    { label: "Signatory selected", completed: signatorySelected, weight: 25 },
    { label: "Recipient info (optional)", completed: !!recipientName, weight: 15 },
    { label: "Placeholders filled", completed: !bodyText.includes("[") || bodyText.includes("[]"), weight: 10 },
  ];

  const completedWeight = checks
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.weight, 0);

  const progress = Math.min(100, completedWeight);

  const getColor = () => {
    if (progress >= 90) return "#4ade80";
    if (progress >= 60) return "#f0b866";
    if (progress >= 30) return "#fb923c";
    return "#f87171";
  };

  const getStatus = () => {
    if (progress >= 90) return "Ready to generate!";
    if (progress >= 60) return "Almost there...";
    if (progress >= 30) return "Keep going...";
    return "Just getting started";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 rounded-full bg-[#2a2a3a] overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: getColor() }}
          />
        </div>
        <span className="text-xs" style={{ color: getColor() }}>{progress}%</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#12121a] border border-[#2a2a3a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Document Progress</h3>
        <span className="text-sm" style={{ color: getColor() }}>{getStatus()}</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-[#2a2a3a] overflow-hidden mb-4">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${progress}%`, 
            backgroundColor: getColor(),
            boxShadow: `0 0 10px ${getColor()}40`
          }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              check.completed 
                ? "bg-[#4ade80] text-[#0a0a12]" 
                : "bg-[#2a2a3a] text-[#666680]"
            }`}>
              {check.completed ? "✓" : index + 1}
            </div>
            <span className={`text-sm ${check.completed ? "text-[#a0a0a0]" : "text-[#666680]"}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Ready indicator */}
      {progress >= 75 && (
        <div className="mt-4 p-3 rounded-lg bg-[#4ade80]/10 border border-[#4ade80]/30">
          <p className="text-sm text-[#4ade80]">✨ Your document is ready to generate!</p>
        </div>
      )}
    </div>
  );
}
