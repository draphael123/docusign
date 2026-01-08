"use client";

import { useState } from "react";

interface APIAccessProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_ENDPOINTS = [
  { method: "POST", path: "/api/documents", description: "Generate a new document" },
  { method: "GET", path: "/api/documents/:id", description: "Get document by ID" },
  { method: "GET", path: "/api/templates", description: "List all templates" },
  { method: "POST", path: "/api/templates", description: "Create a new template" },
  { method: "DELETE", path: "/api/templates/:id", description: "Delete a template" },
];

const SAMPLE_CODE = {
  curl: `curl -X POST https://api.docgen.app/v1/documents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "tmpl_123",
    "data": {
      "recipient_name": "John Doe",
      "company": "Acme Inc"
    }
  }'`,
  javascript: `const response = await fetch('https://api.docgen.app/v1/documents', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    template_id: 'tmpl_123',
    data: {
      recipient_name: 'John Doe',
      company: 'Acme Inc',
    },
  }),
});

const { document_url } = await response.json();`,
  python: `import requests

response = requests.post(
    'https://api.docgen.app/v1/documents',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'template_id': 'tmpl_123',
        'data': {
            'recipient_name': 'John Doe',
            'company': 'Acme Inc',
        },
    },
)

document_url = response.json()['document_url']`,
};

export default function APIAccess({ isOpen, onClose }: APIAccessProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof SAMPLE_CODE>("curl");
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    const key = `dg_live_${Array.from({ length: 32 }, () => 
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 62)]
    ).join("")}`;
    setApiKey(key);
    setShowKey(true);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(SAMPLE_CODE[selectedLanguage]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12121a]/95 backdrop-blur-md rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#2a2a3a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
          <h2 className="text-xl gradient-text font-semibold">🔑 API Access</h2>
          <button onClick={onClose} className="text-[#666680] hover:text-white text-2xl">×</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Coming Soon Banner */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-[#a78bfa]/10 to-[#f472b6]/10 border border-[#a78bfa]/30">
            <p className="text-[#a0a0a0]">
              <strong className="text-white">🚀 API Access Coming Soon!</strong> This is a preview of the upcoming API functionality.
            </p>
          </div>

          {/* API Key Section */}
          <div className="mb-8">
            <h3 className="text-lg text-white font-medium mb-4">Your API Key</h3>
            <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
              {apiKey ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <code className="flex-1 px-3 py-2 rounded bg-[#12121a] text-[#4ecdc4] font-mono text-sm">
                      {showKey ? apiKey : "•".repeat(40)}
                    </code>
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="px-3 py-2 rounded bg-[#2a2a3a] text-white text-sm"
                    >
                      {showKey ? "Hide" : "Show"}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-2 rounded bg-[#4ecdc4] text-[#0a0a12] text-sm"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-[#f87171]">
                    ⚠️ Keep this key secret. Don&apos;t share it publicly or commit it to version control.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[#666680] mb-4">No API key generated yet.</p>
                  <button
                    onClick={generateKey}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white"
                  >
                    Generate API Key
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Endpoints */}
          <div className="mb-8">
            <h3 className="text-lg text-white font-medium mb-4">Endpoints</h3>
            <div className="space-y-2">
              {API_ENDPOINTS.map((endpoint, index) => (
                <div key={index} className="p-3 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    endpoint.method === "GET" ? "bg-[#4ade80]/20 text-[#4ade80]" :
                    endpoint.method === "POST" ? "bg-[#60a5fa]/20 text-[#60a5fa]" :
                    "bg-[#f87171]/20 text-[#f87171]"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-[#a0a0a0] font-mono text-sm">{endpoint.path}</code>
                  <span className="text-sm text-[#666680] ml-auto">{endpoint.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Examples */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-white font-medium">Code Examples</h3>
              <div className="flex gap-2">
                {(Object.keys(SAMPLE_CODE) as Array<keyof typeof SAMPLE_CODE>).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1 rounded text-sm capitalize ${
                      selectedLanguage === lang
                        ? "bg-[#a78bfa] text-white"
                        : "bg-[#2a2a3a] text-[#a0a0a0]"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#a0a0a0] font-mono overflow-auto">
                {SAMPLE_CODE[selectedLanguage]}
              </pre>
              <button
                onClick={copyCode}
                className="absolute top-2 right-2 px-3 py-1 rounded bg-[#2a2a3a] text-white text-sm hover:bg-[#3a3a4a]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="mt-8 p-4 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
            <h4 className="text-white font-medium mb-2">Rate Limits</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[#666680]">Free Tier</span>
                <p className="text-white">100 requests/day</p>
              </div>
              <div>
                <span className="text-[#666680]">Pro Tier</span>
                <p className="text-[#a78bfa]">10,000 requests/day</p>
              </div>
              <div>
                <span className="text-[#666680]">Enterprise</span>
                <p className="text-[#4ecdc4]">Unlimited</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

