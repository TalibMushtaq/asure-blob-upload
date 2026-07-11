import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const defaultContainer = process.env.AZURE_STORAGE_CONTAINER_NAME || "uploads";

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

async function ensureContainer(containerName: string = defaultContainer) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
}

export async function uploadBlob(
  file: Buffer,
  fileName: string,
  contentType: string,
  containerName?: string
) {
  const containerClient = await ensureContainer(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  await blockBlobClient.uploadData(file, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return { name: fileName, url: blockBlobClient.url, container: containerName || defaultContainer };
}

export interface FolderItem {
  name: string;
}

export interface FileItem {
  name: string;
  createdOn?: Date;
  size?: number;
  contentType?: string;
}

export async function listByHierarchy(prefix?: string, containerName?: string) {
  const containerClient = await ensureContainer(containerName);
  const folders: FolderItem[] = [];
  const files: FileItem[] = [];

  const seenFolders = new Set<string>();
  const normalizedPrefix = prefix ? (prefix.endsWith("/") ? prefix : prefix + "/") : "";

  for await (const item of containerClient.listBlobsByHierarchy("/", { prefix: normalizedPrefix })) {
    if (item.kind === "prefix") {
      const folderName = item.name.slice(normalizedPrefix.length).replace(/\/$/, "");
      if (folderName && !seenFolders.has(folderName)) {
        seenFolders.add(folderName);
        folders.push({ name: folderName });
      }
    } else {
      const displayName = item.name.slice(normalizedPrefix.length);
      if (displayName && displayName !== ".folder") {
        files.push({
          name: displayName,
          createdOn: item.properties.createdOn,
          size: item.properties.contentLength,
          contentType: item.properties.contentType,
        });
      }
    }
  }

  return { folders, files };
}

export async function createFolder(folderPath: string, containerName?: string) {
  const containerClient = await ensureContainer(containerName);
  const placeholder = folderPath.endsWith("/")
    ? folderPath + ".folder"
    : folderPath + "/.folder";
  const blockBlobClient = containerClient.getBlockBlobClient(placeholder);
  await blockBlobClient.uploadData(Buffer.from(""), {
    blobHTTPHeaders: { blobContentType: "application/x-directory" },
  });
  return { name: folderPath };
}

export async function deleteBlob(blobName: string, containerName?: string) {
  const containerClient = await ensureContainer(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
}

export async function deleteFolder(prefix: string, containerName?: string) {
  const containerClient = await ensureContainer(containerName);
  const normalizedPrefix = prefix.endsWith("/") ? prefix : prefix + "/";
  const toDelete: string[] = [];
  for await (const blob of containerClient.listBlobsFlat({ prefix: normalizedPrefix })) {
    toDelete.push(blob.name);
  }
  for (const name of toDelete) {
    await containerClient.getBlockBlobClient(name).deleteIfExists();
  }
}

export function generateSasUrl(
  blobName: string,
  expiryMinutes: number = 5256000,
  containerName?: string
): string {
  const container = containerName || defaultContainer;
  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(new Date().valueOf() - 5 * 60 * 1000),
      expiresOn: new Date(new Date().valueOf() + expiryMinutes * 60 * 1000),
    },
    sharedKeyCredential
  ).toString();
  return `https://${accountName}.blob.core.windows.net/${container}/${blobName}?${sas}`;
}

export function generateUploadSasUrl(
  blobName: string,
  expiryMinutes: number = 60,
  containerName?: string
): string {
  const container = containerName || defaultContainer;
  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      startsOn: new Date(new Date().valueOf() - 5 * 60 * 1000),
      expiresOn: new Date(new Date().valueOf() + expiryMinutes * 60 * 1000),
    },
    sharedKeyCredential
  ).toString();
  return `https://${accountName}.blob.core.windows.net/${container}/${blobName}?${sas}`;
}

export async function listContainers() {
  const containers: string[] = [];
  for await (const container of blobServiceClient.listContainers()) {
    containers.push(container.name);
  }
  return containers;
}

export async function setupCors() {
  const origins = process.env.CORS_ORIGINS || "*";
  await blobServiceClient.setProperties({
    cors: [
      {
        allowedOrigins: origins,
        allowedMethods: "GET,HEAD,PUT,DELETE,OPTIONS",
        allowedHeaders: "x-ms-*,content-type,content-length",
        exposedHeaders: "x-ms-*",
        maxAgeInSeconds: 86400,
      },
    ],
  });
  return { cors: "configured", origins };
}
