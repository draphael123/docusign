import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, suggestion } = await request.json();

    // Validation
    if (!name || !email || !suggestion) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (suggestion.trim().length < 10) {
      return NextResponse.json(
        { error: "Suggestion must be at least 10 characters long" },
        { status: 400 }
      );
    }

    // Log the suggestion (in production, you might want to save to a database or send an email)
    console.log("New suggestion received:", {
      name,
      email,
      suggestion,
      timestamp: new Date().toISOString(),
    });

    // TODO: In production, you could:
    // 1. Save to a database (e.g., MongoDB, PostgreSQL)
    // 2. Send an email notification (e.g., using SendGrid, Resend, or Nodemailer)
    // 3. Store in a file or external service
    // 4. Send to a webhook or API endpoint

    // For now, we'll just return success
    // You can extend this to actually store the data
    return NextResponse.json({
      success: true,
      message: "Suggestion submitted successfully",
    });
  } catch (error) {
    console.error("Error in suggestions route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

