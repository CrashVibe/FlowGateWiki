import type { MDXComponents } from "mdx/types"
import { ImageZoom } from "fumadocs-ui/components/image-zoom"
import defaultComponents from "fumadocs-ui/mdx"

import { VersionFilename } from "@/components/version-filename"
import { Video } from "@/components/video"

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    VersionFilename: (props: any) => <VersionFilename {...props} />,
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
    Video: (props: any) => <Video {...props} />,
    // @ts-expect-error - img props not fully compatible with ImageZoom
    img: (props) => <ImageZoom {...props} />,
    ...components,
  }
}
