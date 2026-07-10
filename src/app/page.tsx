"use client";

import { useState, useEffect, useCallback, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";

interface FolderItem { name: string; }
interface FileItem { name: string; createdOn?: string; size?: number; contentType?: string; }
type UploadEntry = { file: File; relativePath: string };

const CSS = `
.app{display:flex;height:100vh;width:100%;font-family:'IBM Plex Sans',sans-serif;overflow:hidden;background:#0A0B0D}
.app *{box-sizing:border-box;margin:0;padding:0}
.app ::selection{background:rgba(108,155,255,.13)}

/* Rail */
.rail{width:291px;flex-shrink:0;background:#121417;border-right:1px solid #2E3238;display:flex;flex-direction:column;padding:22px 17px}
.rail .brand{display:flex;align-items:center;gap:11px;margin-bottom:28px;padding-left:3px}
.rail .brand span{font-size:18px;font-weight:600;letter-spacing:.3px;color:#ECEDEE}
.rail .brand svg{color:#6C9BFF}
.rail-label{font-size:14px;color:#82889A;letter-spacing:.8px;margin-bottom:8px;padding-left:6px;text-transform:uppercase}
.container-list{display:flex;flex-direction:column;gap:3px;flex:1;overflow:auto}
.c-row{text-align:left;padding:8px 11px 10px;border-radius:8px;border:1px solid transparent;border-left:3px solid transparent;cursor:pointer;width:100%;background:transparent;font-family:inherit;color:inherit}
.c-row.active{background:#181B1F;border-color:#2E3238;border-left-color:#6C9BFF}
.c-row .ctop{display:flex;justify-content:space-between;align-items:baseline}
.c-row .cname{font-size:17px;color:#A8ADB8;font-weight:500}
.c-row.active .cname{color:#ECEDEE}
.c-row .cused{font-size:13px;font-family:'IBM Plex Mono',monospace;color:#82889A}
.c-bar-track{height:3px;background:#22262B;border-radius:1px;margin-top:6px;overflow:hidden}
.c-bar-fill{height:100%;background:#6C9BFF;border-radius:1px;transition:width .3s}
.c-bar-fill.warn{background:#E8A33D}
.rail-footer{margin-top:auto;padding-top:17px;border-top:1px solid #22262B;display:flex;flex-direction:column;gap:8px}
.rail-footer div{font-size:14px;color:#82889A;font-family:'IBM Plex Mono',monospace}

/* Main */
.main{flex:1;display:flex;flex-direction:column;min-width:0;position:relative}
.topbar{display:flex;align-items:center;gap:11px;padding:14px 22px;border-bottom:1px solid #2E3238;flex-shrink:0}
.breadcrumb{display:flex;align-items:center;gap:6px;font-family:'IBM Plex Mono',monospace;font-size:17px;flex:1;min-width:0;overflow:hidden;white-space:nowrap}
.crumb{color:#A8ADB8;cursor:pointer;border:none;background:none;font-family:inherit;font-size:inherit;padding:0}
.crumb.current{color:#ECEDEE}
.crumb-sep{color:#82889A;display:flex;align-items:center}
.search-wrap{position:relative}
.search-wrap svg{position:absolute;left:11px;top:11px;color:#82889A}
.search-wrap input{background:#121417;border:1px solid #2E3238;border-radius:8px;padding:8px 11px 8px 36px;font-size:17px;color:#ECEDEE;width:224px;outline:none;font-family:inherit}
.search-wrap input::placeholder{color:#82889A}

/* Buttons */
.btn{display:flex;align-items:center;gap:7px;padding:7px 11px;border-radius:8px;border:1px solid #2E3238;background:transparent;color:#A8ADB8;font-size:17px;font-family:inherit;cursor:pointer;white-space:nowrap;transition:all .12s}
.btn:hover{border-color:#82889A;color:#ECEDEE}
.btn.pri{border-color:#6C9BFF;background:rgba(108,155,255,.13);color:#6C9BFF}
.btn.danger{border-color:#F0555C;background:rgba(240,85,92,.12);color:#F0555C}
.btn:disabled{opacity:.4;cursor:not-allowed}

/* Table */
.table-wrap{flex:1;overflow:auto;display:flex;flex-direction:column}
.table-wrap::-webkit-scrollbar{width:8px}
.table-wrap::-webkit-scrollbar-thumb{background:#2E3238;border-radius:4px}
.thead{display:grid;grid-template-columns:1fr 134px 123px 123px;padding:11px 22px;font-size:14px;color:#82889A;letter-spacing:.7px;text-transform:uppercase;border-bottom:1px solid #22262B;flex-shrink:0;position:sticky;top:0;background:#0A0B0D;z-index:2}
.thead span:first-child{cursor:pointer}
.tbody{flex:1}
.tbody .empty-center{display:flex;align-items:center;justify-content:center;height:100%;min-height:280px}
.row{display:grid;grid-template-columns:1fr 134px 123px 123px;align-items:center;padding:10px 22px;border-radius:8px}
.row:hover{background:#181B1F}
.row.folder{cursor:pointer}
.row:hover .actions{opacity:1}
.name-cell{display:flex;align-items:center;gap:11px;min-width:0}
.name-cell svg{flex-shrink:0}
.name-cell svg.folder-icon{color:#6C9BFF}
.name-cell svg.file-icon{color:#A8ADB8}
.name-text{font-size:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#ECEDEE}
.cell-size,.cell-mod{font-size:15px;color:#A8ADB8;font-family:'IBM Plex Mono',monospace}
.cell-mod{color:#82889A}
.actions{display:flex;gap:6px;justify-content:flex-end;opacity:0}
.icon-btn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:7px;color:#A8ADB8;background:none;border:none;cursor:pointer}
.icon-btn:hover{background:#22262B;color:#ECEDEE}
.icon-btn.danger-hover:hover{color:#F0555C;background:rgba(240,85,92,.12)}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;color:#82889A;text-align:center}
.empty svg{margin-bottom:11px;opacity:.5}
.empty .e1{font-size:18px;color:#A8ADB8}
.empty .e2{font-size:15px;margin-top:6px;color:#82889A}

/* Overlays */
.drag-overlay{position:absolute;inset:11px;background:rgba(10,11,13,.88);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;z-index:50;border:3px dashed #6C9BFF;border-radius:14px}
.drag-overlay.show{display:flex}
.drag-overlay .dtext{text-align:center;color:#6C9BFF}
.drag-overlay .dtext div:last-child{font-size:18px;font-family:'IBM Plex Mono',monospace;margin-top:11px;color:#ECEDEE}
.upload-pill{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);background:#121417;border:1px solid #2E3238;border-radius:13px;padding:14px 22px;width:448px;box-shadow:0 11px 34px rgba(0,0,0,.4);z-index:40;display:none}
.upload-pill.show{display:block}
.up-top{display:flex;justify-content:space-between;font-size:15px;margin-bottom:8px}
.up-name{color:#A8ADB8;font-family:'IBM Plex Mono',monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px}
.up-count{color:#82889A;font-family:'IBM Plex Mono',monospace}
.up-track{height:6px;background:#22262B;border-radius:3px;overflow:hidden}
.up-fill{height:100%;width:0;background:#6C9BFF;border-radius:3px;transition:width .12s linear}
.toast{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);background:#181B1F;border:1px solid #2E3238;border-radius:10px;padding:11px 20px;font-size:17px;display:none;align-items:center;gap:10px;z-index:41;color:#ECEDEE}
.toast.show{display:flex}
.toast svg{color:#4EDD8B}

/* Modals */
.m-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:60}
.m-backdrop.show{display:flex}
.m-box{background:#121417;border:1px solid #2E3238;border-radius:14px;padding:28px;width:448px;box-shadow:0 17px 45px rgba(0,0,0,.5)}
.m-title{font-size:18px;font-weight:500;color:#ECEDEE;margin-bottom:17px;display:flex;align-items:center;gap:11px}
.m-desc{font-size:17px;color:#A8ADB8;margin-bottom:17px;line-height:1.5}
.m-box input{width:100%;box-sizing:border-box;background:#0A0B0D;border:1px solid #2E3238;border-radius:8px;padding:11px 14px;font-size:18px;color:#ECEDEE;outline:none;margin-bottom:11px;font-family:inherit}
.m-box .mono-input{font-family:'IBM Plex Mono',monospace;font-size:17px}
.f-label{font-size:15px;color:#82889A;margin-bottom:6px;display:block}
.f-label b{font-family:'IBM Plex Mono',monospace;color:#A8ADB8;font-weight:500}
.m-actions{display:flex;justify-content:flex-end;gap:11px;margin-top:3px}

/* Logs */
.logs-toggle{position:absolute;bottom:34px;right:34px;width:53px;height:53px;border-radius:27px;background:#121417;border:1px solid #2E3238;display:flex;align-items:center;justify-content:center;z-index:45;cursor:pointer;color:#A8ADB8}
.logs-toggle.active{color:#6C9BFF}
.logs-drawer{position:absolute;top:0;right:0;bottom:0;width:420px;background:#121417;border-left:1px solid #2E3238;transform:translateX(100%);transition:transform .18s;z-index:44;display:flex;flex-direction:column}
.logs-drawer.open{transform:translateX(0)}
.logs-head{display:flex;justify-content:space-between;align-items:center;padding:17px 22px;border-bottom:1px solid #2E3238}
.logs-head span{font-size:17px;font-weight:500;color:#ECEDEE}
.logs-head svg{color:#A8ADB8;cursor:pointer}
.logs-head button{background:none;border:none;cursor:pointer;display:flex}
.logs-body{flex:1;overflow:auto;padding:11px 22px}
.logs-body::-webkit-scrollbar{width:8px}
.logs-body::-webkit-scrollbar-thumb{background:#2E3238;border-radius:4px}
.log-line{font-family:'IBM Plex Mono',monospace;font-size:15px;margin-bottom:8px;line-height:1.5}
.log-time{color:#82889A}
.log-ok{color:#4EDD8B}
.log-danger{color:#F0555C}
.log-info{color:#A8ADB8}
.log-warn{color:#E8A33D}

/* Uploader modal */
.uploader-dropzone{border:2px dashed #2E3238;border-radius:11px;padding:28px 22px;text-align:center;margin:14px 0;transition:border-color .12s,background .12s;display:flex;flex-direction:column;align-items:center;gap:10px;cursor:pointer}
.uploader-dropzone.drag-active{border-color:#6C9BFF;background:rgba(108,155,255,.07)}
.uploader-dropzone .dz-icon{margin-bottom:4px}
.uploader-dropzone .dz-title{font-size:17px;color:#A8ADB8}
.uploader-dropzone .dz-sub{font-size:14px;color:#82889A}
.uploader-files{max-height:224px;overflow:auto;width:100%;text-align:left;margin-top:6px}
.uploader-files::-webkit-scrollbar{width:5px}
.uploader-files::-webkit-scrollbar-thumb{background:#2E3238;border-radius:3px}
.uf-row{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:15px;color:#A8ADB8;border-bottom:1px solid #1A1D22}
.uf-row .uf-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;display:flex;align-items:center;gap:8px}
.uf-row .uf-name svg{flex-shrink:0;color:#82889A}
.uf-row .uf-size{color:#82889A;font-family:'IBM Plex Mono',monospace;font-size:13px;white-space:nowrap}
.uf-row .uf-remove{background:none;border:none;color:#555A62;cursor:pointer;padding:2px 4px;font-size:16px;font-family:inherit;line-height:1;border-radius:4px}
.uf-row .uf-remove:hover{color:#F0555C;background:rgba(240,85,92,.10)}
.uploader-dest{display:flex;align-items:center;gap:8px;font-size:15px;font-family:'IBM Plex Mono',monospace;color:#A8ADB8;background:#0A0B0D;border-radius:8px;padding:9px 14px}
.uploader-dest .dest-label{color:#82889A;font-size:14px;margin-right:4px}
.uploader-dest .dest-path{color:#6C9BFF}
.m-box select{width:100%;box-sizing:border-box;background:#0A0B0D;border:1px solid #2E3238;border-radius:8px;padding:10px 14px;font-size:17px;color:#ECEDEE;outline:none;font-family:inherit;appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2382889A' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:40px;cursor:pointer}
.m-box select option{background:#121417;color:#ECEDEE}
`;

const S = {
  folder: (c?: string) => `<svg class="${c||"folder-icon"}" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 4h5l2 3h9a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>`,
  file: `<svg class="file-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  image: `<svg class="file-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  archive: `<svg class="file-icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 3v18"/></svg>`,
  link: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  chevron: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4EDD8B" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn: `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  upload: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  drag: `<svg width="31" height="31" viewBox="0 0 24 24" fill="none" stroke="#6C9BFF" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  terminal: `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
};

function formatSize(bytes?: number): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function fileIconHtml(name: string, contentType?: string) {
  if (contentType?.startsWith("image/")) return S.image;
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext && ["zip","gz","rar","7z","tar"].includes(ext)) return S.archive;
  return S.file;
}

function formatMod(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

async function* walkEntries(entry: FileSystemEntry, basePath = ""): AsyncGenerator<UploadEntry> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject));
    yield { file, relativePath: basePath };
  } else if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const entries = await new Promise<FileSystemEntry[]>((resolve) => reader.readEntries(resolve));
    for (const child of entries) yield* walkEntries(child, basePath + entry.name + "/");
  }
}

async function collectEntries(items: DataTransferItemList): Promise<UploadEntry[]> {
  const result: UploadEntry[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind !== "file") continue;
    const entry = item.webkitGetAsEntry?.() ?? null;
    if (entry) for await (const e of walkEntries(entry)) result.push(e);
  }
  return result;
}

function uploadOne(
  file: File,
  relativePath: string,
  container: string,
  currentPrefix: string,
  onProgress: (loaded: number, total: number) => void,
  addLog: (msg: string, status: string) => void
): Promise<boolean> {
  return new Promise(async (resolve) => {
    const blobName = currentPrefix + relativePath;
    const params = new URLSearchParams({ blob: blobName, container });
    try {
      addLog(`Upload: ${relativePath || file.name} (${formatSize(file.size)})`, "info");
      const sasRes = await fetch(`/api/sas-upload?${params}`);
      const sasData = await sasRes.json();
      if (!sasData.url) throw new Error(`SAS error: ${JSON.stringify(sasData)}`);
      addLog(`  → direct to Azure`, "info");
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded, e.total); };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) { addLog(`  ✓ OK`, "ok"); resolve(true); }
        else { addLog(`  ✗ HTTP ${xhr.status}`, "danger"); resolve(false); }
      };
      xhr.onerror = () => { addLog(`  ✗ network error`, "danger"); resolve(false); };
      xhr.ontimeout = () => { addLog(`  ✗ timeout`, "danger"); resolve(false); };
      xhr.timeout = 300000;
      xhr.open("PUT", sasData.url);
      xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
      xhr.setRequestHeader("x-ms-blob-content-type", file.type || "application/octet-stream");
      xhr.send(file);
    } catch (err: any) {
      addLog(`  → falling back to server`, "warn");
      try {
        const body = new FormData();
        body.append("file", file);
        body.append("container", container);
        body.append("prefix", currentPrefix + relativePath);
        const res = await fetch("/api/upload", { method: "POST", body });
        if (res.ok) addLog(`  ✓ server OK`, "ok"); else addLog(`  ✗ server ${res.status}`, "danger");
        resolve(res.ok);
      } catch {
        addLog(`  ✗ server failed`, "danger");
        resolve(false);
      }
    }
  });
}

interface ContainerInfo { name: string; count: number; size: number }

export default function Home() {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [containers, setContainers] = useState<ContainerInfo[]>([]);
  const [selectedContainer, setSelectedContainer] = useState("uploads");
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [uploading, setUploading] = useState(false);
  const [upFile, setUpFile] = useState("");
  const [upCount, setUpCount] = useState("");
  const [upPct, setUpPct] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [delConfirm, setDelConfirm] = useState<{ type: "file" | "folder"; name: string; fullPath: string } | null>(null);
  const [delInputName, setDelInputName] = useState("");
  const [delInputWord, setDelInputWord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [logs, setLogs] = useState<{ t: string; msg: string; status: string }[]>([]);
  const [logsOpen, setLogsOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [uploaderEntries, setUploaderEntries] = useState<UploadEntry[]>([]);
  const [uploaderDragOver, setUploaderDragOver] = useState(false);
  const [uploaderContainer, setUploaderContainer] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaderFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addLog = useCallback((msg: string, status = "info") => {
    const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev.slice(-199), { t, msg, status }]);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  }, []);

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch("/api/blobs?containers=true");
      const names: string[] = await res.json();
      if (Array.isArray(names)) {
        const infos: ContainerInfo[] = [];
        for (const name of names) {
          try {
            const r = await fetch(`/api/blobs?container=${encodeURIComponent(name)}&prefix=`);
            const d = await r.json();
            if (d.files) {
              const totalSize = (d.files as FileItem[]).reduce((s, f) => s + (f.size || 0), 0);
              infos.push({ name, count: d.files.length + d.folders.length, size: totalSize });
            } else {
              infos.push({ name, count: 0, size: 0 });
            }
          } catch {
            infos.push({ name, count: 0, size: 0 });
          }
        }
        setContainers(infos);
      }
    } catch {}
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ container: selectedContainer });
      if (prefix) params.set("prefix", prefix);
      const res = await fetch(`/api/blobs?${params}`);
      const data = await res.json();
      if (data.folders) { setFolders(data.folders); setFiles(data.files); }
    } catch { setFolders([]); setFiles([]); }
    finally { setLoading(false); }
  }, [selectedContainer, prefix]);

  useEffect(() => { fetchContainers(); }, [fetchContainers]);
  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { setPrefix(""); setSearch(""); }, [selectedContainer]);
  useEffect(() => {
    addLog("Setting up CORS...", "info");
    fetch("/api/cors-setup").then(r => r.json()).then(d => addLog(`CORS: ${d.error || "OK"}`, d.error ? "danger" : "ok")).catch(() => addLog("CORS: failed", "danger"));
  }, []);

  function navigate(folderName: string) {
    setPrefix((prev) => prev ? prev + folderName + "/" : folderName + "/");
    setSearch("");
  }

  function breadcrumbs() {
    if (!prefix) return [];
    const parts = prefix.replace(/\/$/, "").split("/");
    return parts.map((p, i) => ({
      label: p,
      prefix: parts.slice(0, i + 1).join("/") + "/",
    }));
  }

  async function handleUpload(entries: UploadEntry[], containerOverride?: string) {
    if (entries.length === 0) return;
    setUploading(true);
    setUpPct(0);
    const container = containerOverride || selectedContainer;
    const totalBytes = entries.reduce((s, e) => s + e.file.size, 0);
    setUpCount(`0 / ${entries.length}`);
    addLog(`Starting ${entries.length} file(s), ${formatSize(totalBytes)} total`, "info");

    let ok = 0;
    let completedBytes = 0;
    const perFileDone = new Array(entries.length).fill(0);

    for (let i = 0; i < entries.length; i++) {
      const { file, relativePath } = entries[i];
      setUpFile(file.name);
      setUpCount(`${i} / ${entries.length}`);

      const success = await uploadOne(file, relativePath, container, prefix, (loaded) => {
        perFileDone[i] = loaded;
        const totalLoaded = completedBytes + loaded;
        setUpPct(totalBytes > 0 ? Math.round((totalLoaded / totalBytes) * 100) : 0);
      }, addLog);

      completedBytes += file.size;
      if (success) ok++;
      setUpCount(`${i + 1} / ${entries.length}`);
    }

    setUploading(false);
    setUpFile("");
    setUpCount("");
    setUpPct(0);
    addLog(`Upload complete: ${ok}/${entries.length} files`, ok === entries.length ? "ok" : "warn");
    showToast(`Uploaded ${ok} of ${entries.length} files`);
    await fetchItems();
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;
    const entries: UploadEntry[] = [];
    for (let i = 0; i < inputFiles.length; i++) {
      const f = inputFiles[i];
      entries.push({ file: f, relativePath: (f as any).webkitRelativePath || f.name });
    }
    await handleUpload(entries);
    e.target.value = "";
  }

  function handleUploaderDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); setUploaderDragOver(true); }
  function handleUploaderDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); setUploaderDragOver(false); }
  async function handleUploaderDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation(); setUploaderDragOver(false);
    if (e.dataTransfer?.items) {
      const entries = await collectEntries(e.dataTransfer.items);
      setUploaderEntries((prev) => [...prev, ...entries]);
    }
  }

  async function handleUploaderFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const inputFiles = e.target.files;
    if (!inputFiles || inputFiles.length === 0) return;
    const entries: UploadEntry[] = [];
    for (let i = 0; i < inputFiles.length; i++) {
      const f = inputFiles[i];
      entries.push({ file: f, relativePath: (f as any).webkitRelativePath || f.name });
    }
    setUploaderEntries((prev) => [...prev, ...entries]);
    e.target.value = "";
  }

  function removeUploaderEntry(index: number) {
    setUploaderEntries((prev) => prev.filter((_, i) => i !== index));
  }

  async function startUploaderUpload() {
    if (uploaderEntries.length === 0 || uploading) return;
    const container = uploaderContainer || selectedContainer;
    await handleUpload(uploaderEntries, container);
    setUploaderEntries([]);
    setShowUploader(false);
  }

  function requestDeleteFile(blobName: string) {
    const fullName = prefix ? prefix + blobName : blobName;
    setDelConfirm({ type: "file", name: blobName, fullPath: fullName });
    setDelInputName("");
    setDelInputWord("");
  }

  function requestDeleteFolder(folderName: string) {
    const fullPrefix = prefix ? prefix + folderName + "/" : folderName + "/";
    setDelConfirm({ type: "folder", name: folderName, fullPath: fullPrefix });
    setDelInputName("");
    setDelInputWord("");
  }

  async function confirmDelete() {
    if (!delConfirm) return;
    setDeleting(true);
    try {
      if (delConfirm.type === "file") {
        const res = await fetch(`/api/blobs?blob=${encodeURIComponent(delConfirm.fullPath)}&container=${encodeURIComponent(selectedContainer)}`, { method: "DELETE" });
        if (res.ok) {
          addLog(`Deleted file: ${delConfirm.name}`, "danger");
          showToast(`Deleted: ${delConfirm.name}`);
          await fetchItems();
        }
      } else {
        const res = await fetch(`/api/blobs?folder=${encodeURIComponent(delConfirm.fullPath)}&container=${encodeURIComponent(selectedContainer)}`, { method: "DELETE" });
        if (res.ok) {
          addLog(`Deleted folder: ${delConfirm.name}`, "danger");
          showToast(`Deleted folder: ${delConfirm.name}`);
          await fetchItems();
        }
      }
    } catch {}
    setDeleting(false);
    setDelConfirm(null);
  }

  async function handleGetSasUrl(blobName: string) {
    const fullName = prefix ? prefix + blobName : blobName;
    try {
      const res = await fetch(`/api/sas?blob=${encodeURIComponent(fullName)}&container=${encodeURIComponent(selectedContainer)}&expiry=525600`);
      const data = await res.json();
      if (data.url) {
        await navigator.clipboard.writeText(data.url);
        showToast("Link copied — expires in 1 year");
        addLog(`Generated read SAS for ${blobName}`, "ok");
      }
    } catch { showToast("Failed to get URL"); }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await fetch(`/api/blobs?action=mkdir&container=${encodeURIComponent(selectedContainer)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim(), prefix }),
      });
      if (res.ok) {
        addLog(`Created folder: ${prefix || ""}${newFolderName.trim()}`, "ok");
        setNewFolderName("");
        setShowNewFolder(false);
        await fetchItems();
      }
    } catch { addLog("Create folder failed", "danger"); }
    finally { setCreatingFolder(false); }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  async function handleTest() {
    addLog("Running R/W test...", "info");
    try {
      const res = await fetch("/api/test");
      const data = await res.json();
      if (data.success) { addLog("Test passed — read/write OK", "ok"); showToast("Test passed"); }
      else { addLog("Test failed", "danger"); showToast("Test failed"); }
    } catch { addLog("Test: network error", "danger"); showToast("Test request failed"); }
  }

  function handleDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); setDragOver(true); }
  function handleDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); setDragOver(false); }
  async function handleDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    if (e.dataTransfer?.items) {
      const entries = await collectEntries(e.dataTransfer.items);
      await handleUpload(entries);
    }
  }

  const crumbs = breadcrumbs();
  const filteredFiles = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredFolders = folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filteredFolders.map(f => ({ ...f, isFolder: true as const })), ...filteredFiles.map(f => ({ ...f, isFolder: false as const }))]
    .sort((a, b) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
      return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
  const isEmpty = !loading && sorted.length === 0;
  const currentContainer = containers.find(c => c.name === selectedContainer);
  const totalContainerSize = currentContainer?.size || 0;

  return (
    <div className="app" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Rail */}
      <div className="rail">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          <span>Blob Drive</span>
        </div>
        <div className="rail-label">Containers</div>
        <div className="container-list">
          {containers.map((c) => {
            const active = c.name === selectedContainer;
            const pct = 100 /* approximate */;
            return (
              <button key={c.name} className={`c-row${active ? " active" : ""}`} onClick={() => setSelectedContainer(c.name)}>
                <div className="ctop">
                  <span className="cname">{c.name}</span>
                  <span className="cused">{formatSize(c.size)}</span>
                </div>
                <div className="c-bar-track"><div className={`c-bar-fill${pct > 80 ? " warn" : ""}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
              </button>
            );
          })}
        </div>
        <div className="rail-footer">
          <div>{currentContainer ? `${formatSize(currentContainer.size)} used` : "—"}</div>
          <button className="btn danger" onClick={handleTest} style={{ width: "100%" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            R/W Test
          </button>
          <button className="btn" onClick={handleLogout} style={{ width: "100%" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="breadcrumb">
            <button className={`crumb${!prefix ? " current" : ""}`} onClick={() => { setPrefix(""); setSearch(""); }}>root</button>
            {crumbs.map((c, i) => (
              <span key={c.prefix} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="crumb-sep" dangerouslySetInnerHTML={{ __html: S.chevron }} />
                <button className={`crumb${i === crumbs.length - 1 ? " current" : ""}`} onClick={() => setPrefix(c.prefix)}>
                  {c.label}
                </button>
              </span>
            ))}
          </div>

          <div className="search-wrap">
            <span dangerouslySetInnerHTML={{ __html: S.search }} />
            <input placeholder="Filter files" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <button className="btn" onClick={() => setShowNewFolder(true)}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            New folder
          </button>
          <input ref={fileInputRef} type="file" multiple onChange={handleFileInput} hidden />
          <input ref={uploaderFileInputRef} type="file" multiple onChange={handleUploaderFileInput} hidden />
          <button className="btn pri" onClick={() => { setUploaderContainer(selectedContainer); setUploaderEntries([]); setShowUploader(true); }}>
            <span dangerouslySetInnerHTML={{ __html: S.upload }} />
            Upload
          </button>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div className="thead">
            <span onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} style={{ cursor: "pointer" }}>Name {sortDir === "asc" ? "↑" : "↓"}</span>
            <span>Size</span>
            <span>Modified</span>
            <span></span>
          </div>

          <div className="tbody">
            {loading && (
              <div className="empty-center"><div className="empty"><div className="e1" style={{ color: "#54585F" }}>Loading...</div></div></div>
            )}

            {!loading && isEmpty && (
              <div className="empty-center">
                <div className="empty">
                  <span dangerouslySetInnerHTML={{ __html: S.folder("") }} style={{ opacity: .5, display: "block", marginBottom: 8 }} />
                  <div className="e1">{prefix ? "This folder is empty" : "No files yet"}</div>
                  <div className="e2">Drop files here, or create a folder</div>
                </div>
              </div>
            )}

            {sorted.map((item) => {
              const isFolder = item.isFolder;
              const icon = isFolder ? S.folder("folder-icon") : fileIconHtml(item.name, "contentType" in item ? (item as FileItem).contentType : undefined);
              return (
                <div key={item.name} className={`row${isFolder ? " folder" : ""}`} onClick={() => { if (isFolder) navigate(item.name); }}>
                  <div className="name-cell">
                    <span dangerouslySetInnerHTML={{ __html: icon }} />
                    <span className="name-text">{item.name}</span>
                  </div>
                  <span className="cell-size">{isFolder ? "-" : formatSize((item as FileItem).size)}</span>
                  <span className="cell-mod">{"createdOn" in item ? formatMod((item as FileItem).createdOn) : "—"}</span>
                  <div className="actions">
                    {!isFolder && (
                      <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleGetSasUrl(item.name); }} title="Copy link" dangerouslySetInnerHTML={{ __html: S.link }} />
                    )}
                    <button className="icon-btn danger-hover" onClick={(e) => { e.stopPropagation(); isFolder ? requestDeleteFolder(item.name) : requestDeleteFile(item.name); }} title="Delete" dangerouslySetInnerHTML={{ __html: S.trash }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drag overlay */}
        <div className={`drag-overlay${dragOver ? " show" : ""}`}>
          <div className="dtext">
            <span dangerouslySetInnerHTML={{ __html: S.drag }} />
            <div>Drop to upload to /{selectedContainer}/{prefix}</div>
          </div>
        </div>

        {/* Upload pill */}
        <div className={`upload-pill${uploading ? " show" : ""}`}>
          <div className="up-top">
            <span className="up-name">{upFile}</span>
            <span className="up-count">{upCount}</span>
          </div>
          <div className="up-track">
            <div className="up-fill" style={{ width: `${upPct}%` }} />
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="toast show">
            <span dangerouslySetInnerHTML={{ __html: S.check }} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* New folder modal */}
        {showNewFolder && (
          <div className="m-backdrop show" onClick={() => setShowNewFolder(false)}>
            <div className="m-box" onClick={(e) => e.stopPropagation()}>
              <div className="m-title">New folder</div>
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
                placeholder="Folder name"
              />
              <div className="m-actions">
                <button className="btn" onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}>Cancel</button>
                <button className="btn pri" onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()}>Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Upload modal */}
        {showUploader && (
          <div className="m-backdrop show" onClick={() => { if (!uploading) { setShowUploader(false); setUploaderEntries([]); } }}>
            <div className="m-box" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
              <div className="m-title">
                <span dangerouslySetInnerHTML={{ __html: S.upload }} />
                Upload files
              </div>

              <label className="f-label">Container</label>
              <select
                value={uploaderContainer}
                onChange={(e) => setUploaderContainer(e.target.value)}
              >
                {containers.map((c) => (
                  <option key={c.name} value={c.name}>{c.name} {c.size > 0 ? `(${formatSize(c.size)})` : ""}</option>
                ))}
              </select>

              <div style={{ marginTop: 14 }}>
                <label className="f-label">Destination</label>
                <div className="uploader-dest">
                  <span className="dest-label">/</span>
                  <span className="dest-path">{uploaderContainer || selectedContainer}</span>
                  {prefix && <><span>/</span><span className="dest-path">{prefix}</span></>}
                </div>
              </div>

              {/* Drop zone */}
              <div
                className={`uploader-dropzone${uploaderDragOver ? " drag-active" : ""}`}
                onDragOver={handleUploaderDragOver}
                onDragLeave={handleUploaderDragLeave}
                onDrop={handleUploaderDrop}
                onClick={() => uploaderFileInputRef.current?.click()}
              >
                <span className="dz-icon" dangerouslySetInnerHTML={{ __html: S.drag }} />
                <div className="dz-title">Drag files here or click to browse</div>
                <div className="dz-sub">Folders and subfolders are supported</div>
              </div>

              {/* File queue */}
              {uploaderEntries.length > 0 && (
                <div className="uploader-files">
                  {uploaderEntries.map((entry, i) => (
                    <div key={`${entry.relativePath || entry.file.name}-${i}`} className="uf-row">
                      <span className="uf-name">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        {entry.relativePath || entry.file.name}
                      </span>
                      <span className="uf-size">{formatSize(entry.file.size)}</span>
                      <button className="uf-remove" onClick={(e) => { e.stopPropagation(); removeUploaderEntry(i); }} disabled={uploading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="m-actions">
                <button className="btn" onClick={() => { setShowUploader(false); setUploaderEntries([]); }} disabled={uploading}>Cancel</button>
                <button className="btn pri" onClick={startUploaderUpload} disabled={uploaderEntries.length === 0 || uploading}>
                  Upload{uploaderEntries.length > 0 ? ` (${uploaderEntries.length})` : ""}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {delConfirm && (
          <div className="m-backdrop show" onClick={() => setDelConfirm(null)}>
            <div className="m-box" onClick={(e) => e.stopPropagation()}>
              <div className="m-title" style={{ color: "#F0555C" }}>
                <span dangerouslySetInnerHTML={{ __html: S.warn }} />
                {delConfirm.type === "folder" ? "Delete folder" : "Delete file"}
              </div>
              <div className="m-desc">
                {delConfirm.type === "folder"
                  ? `This permanently deletes "${delConfirm.name}" and everything inside it.`
                  : `This permanently deletes "${delConfirm.name}".`}
              </div>
              {delConfirm.type === "folder" && (
                <>
                  <label className="f-label">Type <b>{delConfirm.name}</b> to confirm</label>
                  <input className="mono-input" autoFocus value={delInputName} onChange={(e) => setDelInputName(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setDelConfirm(null); }} />
                  <label className="f-label">Type <b>DELETE</b> to confirm</label>
                  <input className="mono-input" value={delInputWord} onChange={(e) => setDelInputWord(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setDelConfirm(null); }} />
                </>
              )}
              <div className="m-actions">
                <button className="btn" onClick={() => setDelConfirm(null)}>Cancel</button>
                <button
                  className="btn danger"
                  onClick={confirmDelete}
                  disabled={deleting || (delConfirm.type === "folder" && (delInputName !== delConfirm.name || delInputWord !== "DELETE"))}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logs toggle & drawer */}
        <button className={`logs-toggle${logsOpen ? " active" : ""}`} onClick={() => setLogsOpen(!logsOpen)}>
          <span dangerouslySetInnerHTML={{ __html: S.terminal }} />
        </button>
        <div className={`logs-drawer${logsOpen ? " open" : ""}`}>
          <div className="logs-head">
            <span>Activity ({logs.length})</span>
            <button onClick={() => setLogsOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="logs-body">
            {logs.map((l, i) => (
              <div key={i} className="log-line">
                <span className="log-time">[{l.t}] </span>
                <span className={`log-${l.status}`}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
