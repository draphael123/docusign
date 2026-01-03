"use client";

import { useState } from "react";
import { signatories } from "@/data/signatories";
import { generatePDF } from "@/lib/pdfGenerator";

const documentTypes = [
  "Letter of Recommendation",
  "Letter of Termination",
  "Letter of Employment",
  "Letter of Reference",
  "Letter of Introduction",
  "Letter of Resignation",
  "Letter of Acceptance",
  "Letter of Rejection",
  "Letter of Apology",
  "Letter of Complaint",
  "Letter of Inquiry",
  "Letter of Request",
  "Letter of Confirmation",
  "Letter of Agreement",
  "Letter of Authorization",
  "Custom Document",
];

export default function Home() {
  const [documentType, setDocumentType] = useState<string>("Letter of Recommendation");
  const [selectedSignatory, setSelectedSignatory] = useState<string>(
    signatories[0].id
  );
  const [bodyText, setBodyText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGeneratePDF = async () => {
    if (!bodyText.trim()) {
      alert("Please enter document body text");
      return;
    }

    setIsGenerating(true);
    try {
      const signatory = signatories.find((s) => s.id === selectedSignatory);
      if (!signatory) {
        throw new Error("Signatory not found");
      }

      // Generate PDF
      const pdfBlob = await generatePDF({
        documentType,
        bodyText,
        signatoryName: signatory.name,
        signatoryTitle: signatory.title,
      });

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `${documentType.replace(/\s+/g, "-")}-${signatory.name.replace(/\s+/g, "-")}-${dateStr}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Template Generator
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Generate PDF templates ready to upload to DocuSign
          </p>

          <div className="space-y-6">
            {/* Document Type Dropdown */}
            <div>
              <label
                htmlFor="documentType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Document Type
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Signatory Radio Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signatory
              </label>
              <div className="space-y-2">
                {signatories.map((signatory) => (
                  <label
                    key={signatory.id}
                    className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="signatory"
                      value={signatory.id}
                      checked={selectedSignatory === signatory.id}
                      onChange={(e) => setSelectedSignatory(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {signatory.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {signatory.title}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Body Textarea */}
            <div>
              <label
                htmlFor="bodyText"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Document Body
              </label>
              <textarea
                id="bodyText"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the document body text here..."
              />
            </div>

            {/* Generate PDF Button */}
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating PDF..." : "Generate PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

