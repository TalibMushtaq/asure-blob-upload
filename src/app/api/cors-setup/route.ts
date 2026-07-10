import { NextResponse } from "next/server";
import { setupCors } from "@/lib/blob";

export async function GET() {
  try {
    const result = await setupCors();
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("CORS setup failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
