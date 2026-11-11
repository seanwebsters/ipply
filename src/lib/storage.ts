import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const ALLOWED_MIME: Record<string, "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "image/gif": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "audio/mpeg": "AUDIO",
  "audio/wav": "AUDIO",
  "audio/x-wav": "AUDIO",
  "application/pdf": "DOCUMENT",
};

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "application/pdf": "pdf",
};

export function extensionFor(mime: string) {
  return EXT[mime] ?? "bin";
}

/** Light magic-byte sniffing so the declared type matches the content. */
export function sniffMatches(mime: string, bytes: Uint8Array) {
  const hex = Buffer.from(bytes.subarray(0, 12)).toString("hex");
  const ascii = Buffer.from(bytes.subarray(0, 12)).toString("latin1");
  switch (mime) {
    case "image/jpeg":
      return hex.startsWith("ffd8ff");
    case "image/png":
      return hex.startsWith("89504e47");
    case "image/gif":
      return ascii.startsWith("GIF8");
    case "image/webp":
      return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP";
    case "application/pdf":
      return ascii.startsWith("%PDF");
    case "video/mp4":
      return ascii.slice(4, 8) === "ftyp";
    case "video/webm":
      return hex.startsWith("1a45dfa3");
    case "audio/mpeg":
      return ascii.startsWith("ID3") || hex.startsWith("fff");
    case "audio/wav":
    case "audio/x-wav":
      return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WAVE";
    default:
      return false;
  }
}

interface StorageDriver {
  put(key: string, body: Buffer, contentType: string): Promise<string>; // returns public URL
  remove(key: string): Promise<void>;
}

function localDir() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR || ".uploads");
}

const localDriver: StorageDriver = {
  async put(key, body) {
    const file = path.join(localDir(), key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
    return `/api/media/${key}`;
  },
  async remove(key) {
    await unlink(path.join(localDir(), key)).catch(() => undefined);
  },
};

export async function readLocalObject(key: string) {
  const root = localDir();
  const file = path.resolve(root, key);
  if (!file.startsWith(root + path.sep)) return null; // path traversal guard
  try {
    return await readFile(file);
  } catch {
    return null;
  }
}

function s3Driver(): StorageDriver {
  const bucket = process.env.S3_BUCKET;
  const publicBase = process.env.S3_PUBLIC_BASE_URL;
  if (!bucket || !publicBase) throw new Error("S3_BUCKET and S3_PUBLIC_BASE_URL must be set when STORAGE_DRIVER=s3");
  const client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
        : undefined,
  });
  return {
    async put(key, body, contentType) {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
      return `${publicBase.replace(/\/$/, "")}/${key}`;
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
}

export function storage(): StorageDriver {
  return process.env.STORAGE_DRIVER === "s3" ? s3Driver() : localDriver;
}

export function isLocalStorage() {
  return process.env.STORAGE_DRIVER !== "s3";
}
