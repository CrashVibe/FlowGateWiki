import type { InferPageType } from "fumadocs-core/source";
import type { FileObject } from "next-validate-link";
import { printErrors, scanURLs, validateFiles } from "next-validate-link";

import { source } from "@/lib/source";

const getHeadings = ({ data }: InferPageType<typeof source>): string[] =>
  data.toc?.map((item) => item.url.slice(1)) ?? [];

const getFiles = () => {
  const promises = source
    .getPages()
    .filter((page): page is typeof page & { absolutePath: string } => page.absolutePath !== undefined)
    .map(
      async (page): Promise<FileObject> => ({
        content: await page.data.getText("raw"),
        data: page.data,
        path: page.absolutePath,
        url: page.url,
      })
    );

  return Promise.all(promises);
};

const checkLinks = async () => {
  const scanned = await scanURLs({
    populate: {
      "docs/[[...slug]]": source.getPages().map((page) => ({
        hashes: getHeadings(page),
        value: {
          slug: page.slugs,
        },
      })),
    },
    preset: "next",
  });

  printErrors(
    await validateFiles(await getFiles(), {
      checkRelativePaths: "as-url",
      markdown: {
        components: {
          Card: { attributes: ["href"] },
        },
      },
      scanned,
    }),
    true
  );
};

await checkLinks();
