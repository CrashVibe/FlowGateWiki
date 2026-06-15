import type { InferPageType } from "fumadocs-core/source"
import type { FileObject } from "next-validate-link"
import { printErrors, scanURLs, validateFiles } from "next-validate-link"

import { source } from "@/lib/source"

const getHeadings = async ({ data }: InferPageType<typeof source>): Promise<string[]> => {
  const { toc } = await data.load()
  return toc.map((item) => item.url.slice(1))
}

const getFiles = () => {
  const promises = source
    .getPages()
    .filter(
      (page): page is typeof page & { absolutePath: string } => page.absolutePath !== undefined
    )
    .map(
      async (page): Promise<FileObject> => ({
        content: await page.data.getText("raw"),
        data: page.data,
        path: page.absolutePath,
        url: page.url,
      })
    )

  return Promise.all(promises)
}

const checkLinks = async () => {
  const populateEntries = await Promise.all(
    source.getPages().map(async (page) => ({
      hashes: await getHeadings(page),
      value: {
        slug: page.slugs,
      },
    }))
  )

  const scanned = await scanURLs({
    populate: {
      "docs/[[...slug]]": populateEntries,
    },
    preset: "next",
  })

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
  )
}

await checkLinks()
