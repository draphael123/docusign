import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUserTemplates,
  createTemplate,
  getPublicTemplates,
} from "@/lib/userTemplates";

// GET - Fetch user's templates or public templates
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "user";
  
  if (type === "public") {
    const templates = getPublicTemplates();
    return NextResponse.json({ templates });
  }
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = (session.user as any).id;
  const templates = getUserTemplates(userId);
  
  return NextResponse.json({ templates });
}

// POST - Create a new template
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { name, description, documentType, bodyText, category, tags, isPublic } = body;
    
    if (!name || !documentType || !bodyText) {
      return NextResponse.json(
        { error: "Name, document type, and body text are required" },
        { status: 400 }
      );
    }
    
    const userId = (session.user as any).id;
    const template = createTemplate(userId, {
      name,
      description: description || "",
      documentType,
      bodyText,
      category: category || "Custom",
      tags: tags || [],
      isPublic: isPublic || false,
    });
    
    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

