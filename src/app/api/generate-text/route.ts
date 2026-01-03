import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, documentType } = await request.json();

    if (!prompt || !documentType) {
      return NextResponse.json(
        { error: "Prompt and document type are required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "OpenAI API key not configured",
          message: "Please add OPENAI_API_KEY to your environment variables"
        },
        { status: 500 }
      );
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional document writer. Generate a well-formatted ${documentType} based on the user's prompt. The document should be professional, clear, and appropriate for the document type. Return only the body text of the document, without headers or signatures.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: "Failed to generate text",
          details: errorData.error?.message || "Unknown error"
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || "";

    if (!generatedText) {
      return NextResponse.json(
        { error: "No text generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      text: generatedText,
    });
  } catch (error) {
    console.error("Error in generate-text route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

