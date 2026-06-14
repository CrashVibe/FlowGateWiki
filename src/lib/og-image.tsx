import type { ReactNode } from "react";

interface GenerateOGImageOptions {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  site: ReactNode;
  primaryColor?: string;
  primaryTextColor?: string;
}

/**
 * Vendored copy of `fumadocs-ui/og/takumi`'s `generate()`. The upstream module
 * also imports `@takumi-rs/image-response` (native bindings) at the top level,
 * which crashes when loaded in workerd (Cloudflare Workers). This copy keeps
 * only the pure-JSX layout so the route can pair it with the wasm `ImageResponse`.
 */
export const generate = ({
  primaryColor = "rgba(255,150,255,0.3)",
  primaryTextColor = "rgb(255,150,255)",
  ...props
}: GenerateOGImageOptions) => (
  <div
    style={{
      backgroundColor: "#0c0c0c",
      backgroundImage: `linear-gradient(to top right, ${primaryColor}, transparent)`,
      color: "white",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Inter, Noto Sans SC",
      height: "100%",
      padding: "4rem",
      width: "100%",
    }}
  >
    <div
      style={{
        alignItems: "center",
        color: primaryTextColor,
        display: "flex",
        flexDirection: "row",
        gap: "16px",
        marginBottom: "12px",
      }}
    >
      {props.icon}
      <p style={{ fontSize: "56px", fontWeight: 600, margin: 0 }}>{props.site}</p>
    </div>
    <p style={{ fontSize: "82px", fontWeight: 800, margin: 0 }}>{props.title}</p>
    <p style={{ color: "rgba(240,240,240,0.8)", fontSize: "52px", margin: 0 }}>{props.description}</p>
  </div>
);
