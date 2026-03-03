import { source } from "@/lib/source";

export const revalidate = false;

export const GET = () => {
  const lines = [
    "# Documentation",
    "",
    ...source.getPages().map((page) => `- [${page.data.title}](${page.url}): ${page.data.description}`),
  ];
  return new Response(lines.join("\n"));
};
