import { ImageResponse } from "@takumi-rs/image-response/wasm";
import wasmModule from "@takumi-rs/wasm/takumi_wasm_bg.wasm";
import { notFound } from "next/navigation";

// @ts-expect-error - no type declarations for url asset imports
import interFontUrl from "@/lib/fonts/inter.woff2?url";
import { appName } from "@/lib/shared";
import { getSharedCjkFont } from "@/lib/og-font";
import { generate as DefaultImage } from "@/lib/og-image";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;

export const GET = async (req: Request, { params }: RouteContext<"/og/docs/[...slug]">) => {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) {
    notFound();
  }

  const { title, description = "" } = page.data;

  const [interFont, cjkFont] = await Promise.all([
    fetch(new URL(interFontUrl as string, req.url)).then((res) => res.arrayBuffer()),
    getSharedCjkFont(),
  ]);

  const fonts = [{ data: interFont, name: "Inter" }, ...(cjkFont ? [{ data: cjkFont, name: "Noto Sans SC" }] : [])];

  return new ImageResponse(<DefaultImage description={description} site={appName} title={title} />, {
    fonts,
    format: "webp",
    height: 630,
    module: wasmModule,
    width: 1200,
  });
};

export const generateStaticParams = () =>
  source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
