// @ts-expect-error - no type declarations for raw asset imports
import installScript from "./install.sh?raw";

export const revalidate = false;

export const GET = () =>
  new Response(installScript as string, {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
