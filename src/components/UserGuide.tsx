"use client";

interface UserGuideProps {
  onClose: () => void;
}

export default function UserGuide({ onClose }: UserGuideProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-200">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <h2 className="text-2xl font-bold">User Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none transition-colors"
              aria-label="Close guide"
            >
              ×
            </button>
          </div>
          <p className="text-blue-100 mt-2">Everything you need to know about using the Document Template Generator</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              What is this tool?
            </h3>
            <p className="text-gray-700 leading-relaxed">
              The Document Template Generator creates professional PDF documents ready to upload to DocuSign. 
              Generate letters of recommendation, employment letters, termination notices, and more with custom 
              signatories and beautiful formatting.
            </p>
          </section>

          {/* Step by Step */}
          <section className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Step-by-Step Instructions
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Select Document Type</h4>
                  <p className="text-gray-700">Choose from 16+ document types including letters of recommendation, employment, termination, and more.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Add Recipient Information (Optional)</h4>
                  <p className="text-gray-700">Enter the recipient&apos;s name, title, address, and subject line if needed.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Choose or Create a Signatory</h4>
                  <p className="text-gray-700">Select a predefined signatory or create a custom one with name, title, company, phone, and email.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Customize Formatting</h4>
                  <p className="text-gray-700">Adjust font size (9-14pt) and line spacing (1.0-2.5) to your preference.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Write or Load Document Body</h4>
                  <p className="text-gray-700">Type your document content or load a template from the gallery. Watch the word and character count as you type.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Preview & Download</h4>
                  <p className="text-gray-700">Click &quot;Preview PDF&quot; to review your document, then &quot;Generate & Download PDF&quot; to save it.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Key Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">📚 Template Gallery</h4>
                <p className="text-gray-700 text-sm">Browse pre-written templates for common document types.</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">💾 Auto-Save Drafts</h4>
                <p className="text-gray-700 text-sm">Your work is automatically saved as you type. Never lose progress!</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">👁️ PDF Preview</h4>
                <p className="text-gray-700 text-sm">Preview your document before downloading to ensure it&apos;s perfect.</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">📊 Statistics & Achievements</h4>
                <p className="text-gray-700 text-sm">Track your document generation stats and unlock achievements.</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">📜 Document History</h4>
                <p className="text-gray-700 text-sm">View and reload recently generated documents.</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">⌨️ Keyboard Shortcuts</h4>
                <p className="text-gray-700 text-sm">Press &quot;?&quot; to see available shortcuts for faster workflow.</p>
              </div>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⌨️</span>
              Keyboard Shortcuts
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-700">Save Draft</span>
                <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded font-mono text-sm">Ctrl + S</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-700">Preview PDF</span>
                <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded font-mono text-sm">Ctrl + P</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-gray-700">Generate & Download PDF</span>
                <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded font-mono text-sm">Ctrl + G</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Show Shortcuts Help</span>
                <kbd className="px-3 py-1 bg-gray-200 text-gray-800 rounded font-mono text-sm">?</kbd>
              </div>
            </div>
          </section>

          {/* Tips & Best Practices */}
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Tips & Best Practices
            </h3>
            
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="text-gray-700"><strong>Use templates:</strong> Start with a template from the gallery to save time.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="text-gray-700"><strong>Preview first:</strong> Always preview your document before downloading to catch any errors.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="text-gray-700"><strong>Adjust formatting:</strong> Experiment with font size and line spacing for optimal readability.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="text-gray-700"><strong>Add recipient info:</strong> Including recipient details makes your document more professional.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="text-gray-700"><strong>Custom signatories:</strong> Create custom signatories with complete contact information for personalized documents.</p>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <p className="text-gray-700"><strong>DocuSign ready:</strong> Generated PDFs include a dotted signature line perfect for DocuSign fields.</p>
              </li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              Troubleshooting
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">PDF not generating?</h4>
                <p className="text-gray-700 text-sm">Make sure you&apos;ve entered document body text and selected a signatory.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Draft not loading?</h4>
                <p className="text-gray-700 text-sm">Check that you have a saved draft. Drafts are stored in your browser&apos;s local storage.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Footer cut off in PDF?</h4>
                <p className="text-gray-700 text-sm">This should be fixed in the latest version. Try refreshing the page and regenerating.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Lost your work?</h4>
                <p className="text-gray-700 text-sm">Use the &quot;Load Draft&quot; button - your work is automatically saved as you type!</p>
              </div>
            </div>
          </section>

          {/* Contact/Feedback */}
          <section className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">💬</span>
              Need More Help?
            </h3>
            <p className="text-gray-700 mb-3">
              Have questions or suggestions? We&apos;d love to hear from you!
            </p>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/suggestions';
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold transition-all"
            >
              📝 Send Feedback or Suggestion
            </button>
          </section>
        </div>

        {/* Close Button at Bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg font-semibold transition-all"
          >
            Got it! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

