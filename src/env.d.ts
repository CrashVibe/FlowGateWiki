// oxlint-disable-next-line unicorn/require-module-specifiers
export {};

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*?raw" {
  const content: string;
  export default content;
}

declare module "*?url" {
  const content: string;
  export default content;
}

declare module "./install.sh?raw" {
  const content: string;
  export default content;
}

declare module "@/lib/fonts/inter.woff2?url" {
  const content: string;
  export default content;
}
