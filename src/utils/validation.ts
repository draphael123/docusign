export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestion?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) return { isValid: true };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) return { isValid: true };
  
  // Remove formatting characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  
  if (!/^\d{10,15}$/.test(cleanPhone)) {
    return {
      isValid: false,
      error: "Phone number should be 10-15 digits",
      suggestion: "Example: (555) 123-4567",
    };
  }
  return { isValid: true };
};

export const validateBodyText = (text: string): ValidationResult => {
  if (!text.trim()) {
    return {
      isValid: false,
      error: "Document body cannot be empty",
    };
  }
  
  const wordCount = text.trim().split(/\s+/).length;
  
  if (wordCount < 50) {
    return {
      isValid: true,
      warning: "Document seems short. Consider adding more detail.",
      suggestion: `Current: ${wordCount} words. Recommended: 50+ words`,
    };
  }
  
  if (wordCount > 1000) {
    return {
      isValid: true,
      warning: "Document is quite long. Consider breaking it into sections.",
      suggestion: `Current: ${wordCount} words. Consider condensing.`,
    };
  }
  
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return {
      isValid: false,
      error: "Name is required",
    };
  }
  
  if (name.length < 2) {
    return {
      isValid: false,
      error: "Name must be at least 2 characters",
    };
  }
  
  if (!/^[a-zA-Z\s\-\.]+$/.test(name)) {
    return {
      isValid: false,
      error: "Name should only contain letters, spaces, hyphens, and periods",
    };
  }
  
  return { isValid: true };
};

export const getCharacterCount = (text: string): {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  readingTimeMinutes: number;
} => {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const readingTimeMinutes = Math.ceil(words / 200); // Average reading speed: 200 words/min
  
  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    readingTimeMinutes,
  };
};

