import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from "@/lib/userTemplates";

// GET - Get a single template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const template = getTemplateById(params.id);
  
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  
  // Check if template is public or belongs to the user
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as any).id : null;
  
  if (!template.isPublic && template.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return NextResponse.json({ template });
}

// PATCH - Update a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const userId = (session.user as any).id;
    
    const updated = updateTemplate(params.id, userId, body);
    
    if (!updated) {
      return NextResponse.json(
        { error: "Template not found or unauthorized" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ template: updated });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id;
  const deleted = deleteTemplate(params.id, userId);
  
  if (!deleted) {
    return NextResponse.json(
      { error: "Template not found or unauthorized" },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true });
}

// POST - Duplicate a template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id;
  const template = getTemplateById(params.id);
  
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  
  // Allow duplicating if public or owned by user
  if (!template.isPublic && template.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const duplicated = duplicateTemplate(params.id, userId);
  
  if (!duplicated) {
    return NextResponse.json(
      { error: "Failed to duplicate template" },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ template: duplicated }, { status: 201 });
}

