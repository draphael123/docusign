"use client";

import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
}

interface Workspace {
  id: string;
  name: string;
  members: TeamMember[];
  templatesCount: number;
  documentsCount: number;
}

// Mock data for UI demonstration
const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "personal",
    name: "Personal",
    members: [{ id: "1", name: "You", email: "you@example.com", role: "admin" }],
    templatesCount: 12,
    documentsCount: 47,
  },
];

interface TeamWorkspacesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamWorkspaces({ isOpen, onClose }: TeamWorkspacesProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<string>("personal");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("editor");

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim()) return;
    
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: newWorkspaceName,
      members: [{ id: "1", name: "You", email: "you@example.com", role: "admin" }],
      templatesCount: 0,
      documentsCount: 0,
    };
    
    setWorkspaces([...workspaces, newWorkspace]);
    setActiveWorkspace(newWorkspace.id);
    setNewWorkspaceName("");
    setShowCreateModal(false);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
    };
    
    setWorkspaces(workspaces.map(w => 
      w.id === activeWorkspace 
        ? { ...w, members: [...w.members, newMember] }
        : w
    ));
    
    setInviteEmail("");
    setShowInviteModal(false);
  };

  const getRoleColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "admin": return "#f87171";
      case "editor": return "#4ecdc4";
      case "viewer": return "#a0a0a0";
    }
  };

  if (!isOpen) return null;

  const currentWorkspace = workspaces.find(w => w.id === activeWorkspace);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">👥 Team Workspaces</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-[#2a2a3a] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[#a0a0a0]">Workspaces</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-[#a78bfa] hover:text-[#c4b5fd] text-sm"
              >
                + New
              </button>
            </div>
            
            <div className="space-y-2">
              {workspaces.map(workspace => (
                <button
                  key={workspace.id}
                  onClick={() => setActiveWorkspace(workspace.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    activeWorkspace === workspace.id
                      ? "bg-[#a78bfa]/20 border border-[#a78bfa]/50"
                      : "hover:bg-[#1a1a24]"
                  }`}
                >
                  <div className="text-white font-medium">{workspace.name}</div>
                  <div className="text-xs text-[#666680]">
                    {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>

            {/* Pro Banner */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-[#a78bfa]/20 to-[#f472b6]/20 border border-[#a78bfa]/30">
              <div className="text-sm font-medium text-white mb-1">⭐ Upgrade to Pro</div>
              <div className="text-xs text-[#a0a0a0] mb-3">Unlock unlimited workspaces and team features</div>
              <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white text-sm">
                Upgrade
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            {currentWorkspace && (
              <>
                {/* Workspace Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl text-white font-semibold">{currentWorkspace.name}</h3>
                    <p className="text-sm text-[#666680]">
                      {currentWorkspace.templatesCount} templates • {currentWorkspace.documentsCount} documents
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 rounded-lg bg-[#4ecdc4] text-[#0a0a12] hover:bg-[#3dbdb5] transition-colors"
                  >
                    + Invite
                  </button>
                </div>

                {/* Members */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#a0a0a0] mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {currentWorkspace.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#f472b6] flex items-center justify-center text-white font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white">{member.name}</div>
                            <div className="text-sm text-[#666680]">{member.email}</div>
                          </div>
                        </div>
                        <span 
                          className="px-3 py-1 rounded-full text-xs capitalize"
                          style={{ backgroundColor: `${getRoleColor(member.role)}20`, color: getRoleColor(member.role) }}
                        >
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Placeholder */}
                <div className="p-6 rounded-xl border-2 border-dashed border-[#2a2a3a] text-center">
                  <p className="text-[#666680]">🚀 Team collaboration features coming soon!</p>
                  <p className="text-sm text-[#4a4a5a] mt-1">Share templates, track changes, and work together in real-time.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-[#12121a] rounded-xl p-6 max-w-md w-full border border-[#2a2a3a]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-medium mb-4">Create Workspace</h3>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace name"
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 rounded-lg bg-[#2a2a3a] text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkspace}
                className="flex-1 py-2 rounded-lg bg-[#a78bfa] text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
          <div className="bg-[#12121a] rounded-xl p-6 max-w-md w-full border border-[#2a2a3a]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg text-white font-medium mb-4">Invite Team Member</h3>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white mb-3"
              autoFocus
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamMember["role"])}
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white mb-4"
            >
              <option value="viewer">Viewer - Can view documents</option>
              <option value="editor">Editor - Can edit documents</option>
              <option value="admin">Admin - Full access</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2 rounded-lg bg-[#2a2a3a] text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 py-2 rounded-lg bg-[#4ecdc4] text-[#0a0a12]"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

