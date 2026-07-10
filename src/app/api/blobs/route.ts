import { NextRequest, NextResponse } from "next/server";
import { listByHierarchy, deleteBlob, deleteFolder, createFolder, listContainers } from "@/lib/blob";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix") || undefined;
    const container = searchParams.get("container") || undefined;

    if (searchParams.get("containers") === "true") {
      const containers = await listContainers();
      return NextResponse.json(containers);
    }

    const result = await listByHierarchy(prefix, container);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const container = searchParams.get("container") || undefined;

    if (action === "mkdir") {
      const { name, prefix } = await req.json();
      const folderPath = prefix ? `${prefix}${name}` : name;
      const result = await createFolder(folderPath, container);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const blob = searchParams.get("blob");
    const folder = searchParams.get("folder");
    const container = searchParams.get("container") || undefined;

    if (folder) {
      await deleteFolder(folder, container);
      return NextResponse.json({ deleted: folder, type: "folder" });
    }

    if (blob) {
      await deleteBlob(blob, container);
      return NextResponse.json({ deleted: blob, type: "file" });
    }

    return NextResponse.json({ error: "No blob or folder specified" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
