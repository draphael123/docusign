import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const TEMPLATES_KEY = "shared_user_templates";

export interface UserTemplate {
  id: string;
  name: string;
  documentType: string;
  bodyText: string;
  description: string;
  category: string;
  createdAt?: string;
  createdBy?: string;
}

// GET - Fetch all shared templates
export async function GET() {
  try {
    // Check if KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      // Return empty array if KV not configured (fallback for local dev)
      console.log("Vercel KV not configured, returning empty templates");
      return NextResponse.json({ templates: [], source: "fallback" });
    }

    const templates = await kv.get<UserTemplate[]>(TEMPLATES_KEY);
    return NextResponse.json({ 
      templates: templates || [], 
      source: "kv" 
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates", templates: [] },
      { status: 500 }
    );
  }
}

// POST - Add a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template } = body as { template: Omit<UserTemplate, "id" | "createdAt"> };

    if (!template || !template.name || !template.bodyText) {
      return NextResponse.json(
        { error: "Template name and content are required" },
        { status: 400 }
      );
    }

    // Check if KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json(
        { error: "Storage not configured. Templates will only be saved locally." },
        { status: 503 }
      );
    }

    // Get existing templates
    const existingTemplates = (await kv.get<UserTemplate[]>(TEMPLATES_KEY)) || [];

    // Create new template with ID and timestamp
    const newTemplate: UserTemplate = {
      ...template,
      id: `shared-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    // Add to list
    const updatedTemplates = [...existingTemplates, newTemplate];

    // Save to KV
    await kv.set(TEMPLATES_KEY, updatedTemplates);

    return NextResponse.json({ 
      success: true, 
      template: newTemplate,
      totalTemplates: updatedTemplates.length 
    });
  } catch (error) {
    console.error("Error saving template:", error);
    return NextResponse.json(
      { error: "Failed to save template" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      );
    }

    // Get existing templates
    const existingTemplates = (await kv.get<UserTemplate[]>(TEMPLATES_KEY)) || [];

    // Filter out the template to delete
    const updatedTemplates = existingTemplates.filter((t) => t.id !== templateId);

    if (updatedTemplates.length === existingTemplates.length) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Save updated list
    await kv.set(TEMPLATES_KEY, updatedTemplates);

    return NextResponse.json({ 
      success: true,
      totalTemplates: updatedTemplates.length 
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}

