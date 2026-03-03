import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export const getMDXComponents = (components?: MDXComponents): MDXComponents => ({
  ...defaultComponents,
  img: (props) => <ImageZoom {...props} />,
  ...components,
});
