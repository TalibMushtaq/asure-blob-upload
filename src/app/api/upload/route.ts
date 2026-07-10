import { NextRequest, NextResponse } from "next/server";
import { uploadBlob } from "@/lib/blob";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const container = (formData.get("container") as string) || undefined;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const prefix = (formData.get("prefix") as string) || "";
    const blobName = prefix ? prefix + file.name : file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBlob(buffer, blobName, file.type, container);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
