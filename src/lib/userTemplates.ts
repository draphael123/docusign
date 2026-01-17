import { v4 as uuidv4 } from "uuid";

export interface UserTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  documentType: string;
  bodyText: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  useCount: number;
}

const TEMPLATES_STORAGE_KEY = "docgen_user_templates";

function getStoredTemplates(): UserTemplate[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

function saveStoredTemplates(templates: UserTemplate[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  }
}

// Get templates for a specific user
export function getUserTemplates(userId: string): UserTemplate[] {
  const templates = getStoredTemplates();
  return templates.filter(t => t.userId === userId);
}

// Get all public templates
export function getPublicTemplates(): UserTemplate[] {
  const templates = getStoredTemplates();
  return templates.filter(t => t.isPublic);
}

// Create a new template
export function createTemplate(
  userId: string,
  data: {
    name: string;
    description: string;
    documentType: string;
    bodyText: string;
    category: string;
    tags?: string[];
    isPublic?: boolean;
  }
): UserTemplate {
  const templates = getStoredTemplates();
  
  const newTemplate: UserTemplate = {
    id: uuidv4(),
    userId,
    name: data.name,
    description: data.description,
    documentType: data.documentType,
    bodyText: data.bodyText,
    category: data.category,
    tags: data.tags || [],
    isPublic: data.isPublic || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 0,
  };
  
  templates.push(newTemplate);
  saveStoredTemplates(templates);
  
  return newTemplate;
}

// Update a template
export function updateTemplate(
  templateId: string,
  userId: string,
  updates: Partial<Omit<UserTemplate, "id" | "userId" | "createdAt">>
): UserTemplate | null {
  const templates = getStoredTemplates();
  const index = templates.findIndex(t => t.id === templateId && t.userId === userId);
  
  if (index === -1) return null;
  
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveStoredTemplates(templates);
  return templates[index];
}

// Delete a template
export function deleteTemplate(templateId: string, userId: string): boolean {
  const templates = getStoredTemplates();
  const index = templates.findIndex(t => t.id === templateId && t.userId === userId);
  
  if (index === -1) return false;
  
  templates.splice(index, 1);
  saveStoredTemplates(templates);
  return true;
}

// Get a single template by ID
export function getTemplateById(templateId: string): UserTemplate | null {
  const templates = getStoredTemplates();
  return templates.find(t => t.id === templateId) || null;
}

// Increment use count
export function incrementTemplateUseCount(templateId: string): void {
  const templates = getStoredTemplates();
  const index = templates.findIndex(t => t.id === templateId);
  
  if (index !== -1) {
    templates[index].useCount++;
    saveStoredTemplates(templates);
  }
}

// Duplicate a template for a user
export function duplicateTemplate(templateId: string, newUserId: string): UserTemplate | null {
  const original = getTemplateById(templateId);
  if (!original) return null;
  
  return createTemplate(newUserId, {
    name: `${original.name} (Copy)`,
    description: original.description,
    documentType: original.documentType,
    bodyText: original.bodyText,
    category: original.category,
    tags: original.tags,
    isPublic: false,
  });
}

