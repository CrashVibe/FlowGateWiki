import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const revalidate = false;

let cachedScript: string | null = null;

export const GET = async () => {
  if (!cachedScript) {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const scriptPath = join(currentDir, "install.sh");
    cachedScript = await readFile(scriptPath, "utf8");
  }

  return new Response(cachedScript, {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
};
