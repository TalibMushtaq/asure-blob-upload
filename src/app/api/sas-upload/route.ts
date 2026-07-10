import { NextRequest, NextResponse } from "next/server";
import { generateUploadSasUrl } from "@/lib/blob";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blob = searchParams.get("blob");
    const container = searchParams.get("container") || undefined;
    if (!blob) {
      return NextResponse.json({ error: "No blob name provided" }, { status: 400 });
    }
    const url = generateUploadSasUrl(blob, 60, container);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
