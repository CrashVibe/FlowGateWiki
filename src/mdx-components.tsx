import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { Video } from "./components/video";

export const getMDXComponents = (components?: MDXComponents): MDXComponents => ({
  ...defaultComponents,
  Video,
  img: (props) => <ImageZoom {...props} />,
  ...components,
});
