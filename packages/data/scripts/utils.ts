import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_ROOT = path.resolve(__dirname, "..");
export const RAW_DIR = path.join(DATA_ROOT, "raw");
export const GENERATED_DIR = path.join(DATA_ROOT, "generated");
export const STREETS_DIR = path.join(GENERATED_DIR, "streets");
export const MANIFEST_PATH = path.join(DATA_ROOT, "manifest.json");

export function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseIntField(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (value == null) return NaN;
  return parseInt(String(value).trim(), 10);
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
