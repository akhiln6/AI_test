import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_USER, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (
      email !== ALLOWED_USER.email.toLowerCase() ||
      password !== ALLOWED_USER.password
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password. Please check your credentials.",
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(email);
    const response = NextResponse.json({
      success: true,
      user: {
        email: ALLOWED_USER.email,
        name: ALLOWED_USER.name,
      },
    });

    response.cookies.set({
      name: "billing_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

