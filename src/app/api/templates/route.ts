import { NextRequest, NextResponse } from "next/server";

// Simple JSON storage - just need one env var!
// Using JSONBin.io free tier
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY; // Get free at jsonbin.io
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || ""; // Will be created on first write
const JSONBIN_BASE_URL = "https://api.jsonbin.io/v3/b";

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
    // Check if JSONBin is configured
    if (!JSONBIN_BIN_ID) {
      console.log("JSONBin not configured, returning empty templates");
      return NextResponse.json({ templates: [], source: "fallback" });
    }

    const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": JSONBIN_API_KEY || "",
      },
      // Cache for 30 seconds to reduce API calls
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`JSONBin fetch failed: ${response.status}`);
    }

    const data = await response.json();
    const templates = data.record?.templates || [];

    return NextResponse.json({ 
      templates, 
      source: "jsonbin" 
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates", templates: [] },
      { status: 500 }
    );
  }
}

// Helper to create a new bin if needed
async function createBin(apiKey: string, templates: UserTemplate[]): Promise<string | null> {
  try {
    const response = await fetch(JSONBIN_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": apiKey,
        "X-Bin-Private": "false",
        "X-Bin-Name": "docusign-templates",
      },
      body: JSON.stringify({ templates }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Created new bin:", data.metadata.id);
      return data.metadata.id;
    }
    return null;
  } catch {
    return null;
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

    // Check if API key is configured
    if (!JSONBIN_API_KEY) {
      return NextResponse.json(
        { error: "Storage not configured. Templates will only be saved locally." },
        { status: 503 }
      );
    }

    // Create new template with ID and timestamp
    const newTemplate: UserTemplate = {
      ...template,
      id: `shared-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    let existingTemplates: UserTemplate[] = [];
    let binId: string | null = JSONBIN_BIN_ID || null;

    // If no bin exists, create one
    if (!binId) {
      const newBinId = await createBin(JSONBIN_API_KEY, [newTemplate]);
      if (newBinId) {
        return NextResponse.json({ 
          success: true, 
          template: newTemplate,
          totalTemplates: 1,
          newBinId: newBinId, // Return this so user can add it to env vars
          message: `Template saved! Add JSONBIN_BIN_ID=${newBinId} to your environment variables.`
        });
      }
      throw new Error("Could not create storage bin");
    }

    // Get existing templates
    const fetchResponse = await fetch(`${JSONBIN_BASE_URL}/${binId}/latest`, {
      headers: {
        "X-Master-Key": JSONBIN_API_KEY,
      },
    });

    if (fetchResponse.ok) {
      const data = await fetchResponse.json();
      existingTemplates = data.record?.templates || [];
    }

    // Add to list
    const updatedTemplates = [...existingTemplates, newTemplate];

    // Save to JSONBin
    const updateResponse = await fetch(`${JSONBIN_BASE_URL}/${binId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify({ templates: updatedTemplates }),
    });

    if (!updateResponse.ok) {
      throw new Error(`JSONBin update failed: ${updateResponse.status}`);
    }

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

    // Check if JSONBin is configured
    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      );
    }

    // Get existing templates
    const fetchResponse = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": JSONBIN_API_KEY,
      },
    });

    if (!fetchResponse.ok) {
      throw new Error("Failed to fetch existing templates");
    }

    const data = await fetchResponse.json();
    const existingTemplates: UserTemplate[] = data.record?.templates || [];

    // Filter out the template to delete
    const updatedTemplates = existingTemplates.filter((t) => t.id !== templateId);

    if (updatedTemplates.length === existingTemplates.length) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Save updated list
    const updateResponse = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
      body: JSON.stringify({ templates: updatedTemplates }),
    });

    if (!updateResponse.ok) {
      throw new Error(`JSONBin update failed: ${updateResponse.status}`);
    }

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

