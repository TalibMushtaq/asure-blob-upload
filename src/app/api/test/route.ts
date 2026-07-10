import { NextRequest, NextResponse } from "next/server";
import { uploadBlob, listByHierarchy, deleteBlob } from "@/lib/blob";

export async function GET(req: NextRequest) {
  const results: string[] = [];
  const container = "uploads";
  const testBlob = `.azure-test-${Date.now()}.txt`;
  const testContent = "Azure Blob read/write test";

  try {
    results.push("Uploading test file...");
    await uploadBlob(Buffer.from(testContent), testBlob, "text/plain", container);
    results.push(`Upload OK: ${testBlob}`);

    results.push("Listing blobs...");
    const { files: blobs } = await listByHierarchy(undefined, container);
    const found = blobs.find((b) => b.name === testBlob);
    if (!found) throw new Error("Test blob not found in listing");
    results.push(`List OK: found ${found.name} (${found.size} bytes)`);

    results.push("Deleting test file...");
    await deleteBlob(testBlob, container);
    results.push(`Delete OK: ${testBlob}`);

    return NextResponse.json({ success: true, steps: results });
  } catch (err: any) {
    results.push(`FAILED: ${err.message}`);
    try { await deleteBlob(testBlob, container); } catch {}
    return NextResponse.json({ success: false, steps: results }, { status: 500 });
  }
}
