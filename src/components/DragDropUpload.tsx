"use client";

import { useState, useCallback, useRef } from "react";

interface DragDropUploadProps {
  onFileDrop: (file: File) => void;
  acceptedTypes?: string[];
  children: React.ReactNode;
  className?: string;
}

export default function DragDropUpload({ 
  onFileDrop, 
  acceptedTypes = [".pdf", ".docx", ".doc"], 
  children, 
  className = "" 
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fileName = file.name.toLowerCase();
      const isAccepted = acceptedTypes.some(type => fileName.endsWith(type.toLowerCase()));
      
      if (isAccepted) {
        onFileDrop(file);
      }
      e.dataTransfer.clearData();
    }
  }, [onFileDrop, acceptedTypes]);

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative ${className}`}
    >
      {children}
      
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#a78bfa]/20 border-2 border-dashed border-[#a78bfa] rounded-xl flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <p className="text-white font-medium">Drop file here</p>
            <p className="text-sm text-[#a0a0a0]">{acceptedTypes.join(", ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

