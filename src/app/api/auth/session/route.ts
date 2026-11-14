import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_USER, verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("billing_session")?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: ALLOWED_USER.email,
        name: ALLOWED_USER.name,
      },
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}

