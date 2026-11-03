import { NextResponse } from "next/server";
import { checkDbConnection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await checkDbConnection();
    return NextResponse.json(status);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        connected: false,
        message,
        hasPasswordPlaceholder: message.includes("<db_password>"),
      },
      { status: 200 }
    );
  }
}

