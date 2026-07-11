import { NextRequest, NextResponse } from "next/server";
import { generateSasUrl } from "@/lib/blob";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blob = searchParams.get("blob");
    const expiry = searchParams.get("expiry");
    const container = searchParams.get("container") || undefined;
    if (!blob) {
      return NextResponse.json({ error: "No blob name provided" }, { status: 400 });
    }
    const maxExpiry = 5256000; // 10 years max
    const expiryMin = Math.min(expiry ? parseInt(expiry) : 5256000, maxExpiry);
    const url = generateSasUrl(blob, expiryMin, container);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
