"use client";

import { useState, useEffect } from "react";

export interface Approver {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
}

export interface ApprovalStep {
  approverId: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  timestamp?: string;
  comment?: string;
}

export interface ApprovalWorkflowData {
  id: string;
  documentId: string;
  documentName: string;
  approvers: Approver[];
  steps: ApprovalStep[];
  currentStep: number;
  status: "draft" | "in_review" | "approved" | "rejected";
  createdAt: string;
}

interface ApprovalWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  onSubmitForApproval: (approvers: Approver[]) => void;
}

const PRESET_APPROVERS: Approver[] = [
  { id: "1", name: "Manager", email: "", role: "Manager", order: 1 },
  { id: "2", name: "Legal", email: "", role: "Legal Review", order: 2 },
  { id: "3", name: "Executive", email: "", role: "Executive Approval", order: 3 },
];

export default function ApprovalWorkflow({ isOpen, onClose, documentName, onSubmitForApproval }: ApprovalWorkflowProps) {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [newApprover, setNewApprover] = useState({ name: "", email: "", role: "" });

  const addApprover = () => {
    if (!newApprover.name || !newApprover.email) return;
    const approver: Approver = {
      id: `approver-${Date.now()}`,
      ...newApprover,
      order: approvers.length + 1,
    };
    setApprovers([...approvers, approver]);
    setNewApprover({ name: "", email: "", role: "" });
  };

  const removeApprover = (id: string) => {
    setApprovers(approvers.filter(a => a.id !== id).map((a, i) => ({ ...a, order: i + 1 })));
  };

  const moveApprover = (id: string, direction: "up" | "down") => {
    const index = approvers.findIndex(a => a.id === id);
    if (direction === "up" && index > 0) {
      const newList = [...approvers];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      setApprovers(newList.map((a, i) => ({ ...a, order: i + 1 })));
    } else if (direction === "down" && index < approvers.length - 1) {
      const newList = [...approvers];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      setApprovers(newList.map((a, i) => ({ ...a, order: i + 1 })));
    }
  };

  const addPresetApprover = (preset: Approver) => {
    if (approvers.some(a => a.role === preset.role)) return;
    setApprovers([...approvers, { ...preset, id: `approver-${Date.now()}`, order: approvers.length + 1 }]);
  };

  const handleSubmit = () => {
    if (approvers.length === 0) return;
    onSubmitForApproval(approvers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[--bg-surface] rounded-xl border border-[--border-default] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-[--border-default]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[--text-primary]">Approval Workflow</h2>
            <button onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
          </div>
          <p className="text-sm text-[--text-muted] mt-1">
            Set up reviewers for: <span className="text-[--text-secondary]">{documentName}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Add Presets */}
          <div>
            <h3 className="text-sm font-medium text-[--text-secondary] mb-2">Quick Add</h3>
            <div className="flex flex-wrap gap-2">
              {PRESET_APPROVERS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => addPresetApprover(preset)}
                  disabled={approvers.some(a => a.role === preset.role)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:border-[--color-primary] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + {preset.role}
                </button>
              ))}
            </div>
          </div>

          {/* Current Approvers */}
          {approvers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[--text-secondary] mb-2">Approval Chain</h3>
              <div className="space-y-2">
                {approvers.map((approver, index) => (
                  <div key={approver.id} className="flex items-center gap-3 p-3 rounded-lg bg-[--bg-elevated] border border-[--border-default]">
                    <span className="w-6 h-6 rounded-full bg-[--color-primary] text-white text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-[--text-primary]">{approver.name}</div>
                      <div className="text-xs text-[--text-muted]">{approver.role} • {approver.email || "No email"}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveApprover(approver.id, "up")}
                        disabled={index === 0}
                        className="p-1 text-[--text-muted] hover:text-[--text-primary] disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveApprover(approver.id, "down")}
                        disabled={index === approvers.length - 1}
                        className="p-1 text-[--text-muted] hover:text-[--text-primary] disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeApprover(approver.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Approver */}
          <div>
            <h3 className="text-sm font-medium text-[--text-secondary] mb-2">Add Custom Approver</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={newApprover.name}
                onChange={(e) => setNewApprover({ ...newApprover, name: e.target.value })}
                placeholder="Name"
                className="w-full px-4 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
              />
              <input
                type="email"
                value={newApprover.email}
                onChange={(e) => setNewApprover({ ...newApprover, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
              />
              <input
                type="text"
                value={newApprover.role}
                onChange={(e) => setNewApprover({ ...newApprover, role: e.target.value })}
                placeholder="Role (e.g., Legal Review)"
                className="w-full px-4 py-2 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] text-sm"
              />
              <button
                onClick={addApprover}
                disabled={!newApprover.name || !newApprover.email}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-overlay] border border-[--border-default] text-[--text-primary] hover:border-[--color-primary] disabled:opacity-50 text-sm"
              >
                Add Approver
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[--border-default] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--bg-elevated] border border-[--border-default] text-[--text-primary] hover:bg-[--bg-overlay]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={approvers.length === 0}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[--color-primary] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage approval workflows
export function useApprovalWorkflow() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflowData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("approvalWorkflows");
    if (saved) {
      try {
        setWorkflows(JSON.parse(saved));
      } catch {
        setWorkflows([]);
      }
    }
  }, []);

  const saveWorkflows = (data: ApprovalWorkflowData[]) => {
    setWorkflows(data);
    localStorage.setItem("approvalWorkflows", JSON.stringify(data));
  };

  const createWorkflow = (documentId: string, documentName: string, approvers: Approver[]): ApprovalWorkflowData => {
    const workflow: ApprovalWorkflowData = {
      id: `workflow-${Date.now()}`,
      documentId,
      documentName,
      approvers,
      steps: approvers.map(a => ({ approverId: a.id, status: "pending" })),
      currentStep: 0,
      status: "in_review",
      createdAt: new Date().toISOString(),
    };
    saveWorkflows([...workflows, workflow]);
    return workflow;
  };

  const approveStep = (workflowId: string, comment?: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const newSteps = [...workflow.steps];
    newSteps[workflow.currentStep] = {
      ...newSteps[workflow.currentStep],
      status: "approved",
      timestamp: new Date().toISOString(),
      comment,
    };

    const isComplete = workflow.currentStep >= workflow.approvers.length - 1;
    
    saveWorkflows(workflows.map(w => w.id === workflowId ? {
      ...w,
      steps: newSteps,
      currentStep: isComplete ? w.currentStep : w.currentStep + 1,
      status: isComplete ? "approved" : "in_review",
    } : w));
  };

  const rejectStep = (workflowId: string, comment: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const newSteps = [...workflow.steps];
    newSteps[workflow.currentStep] = {
      ...newSteps[workflow.currentStep],
      status: "rejected",
      timestamp: new Date().toISOString(),
      comment,
    };

    saveWorkflows(workflows.map(w => w.id === workflowId ? {
      ...w,
      steps: newSteps,
      status: "rejected",
    } : w));
  };

  return { workflows, createWorkflow, approveStep, rejectStep };
}

