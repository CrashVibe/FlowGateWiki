/**
 * Stub for `react-dom/server.edge`, aliased in the `rsc` Vite environment only (see
 * vite.config.ts).
 *
 * Fumadocs-core's `source.serializePageTree()` (unused by this app) does `await
 * import("react-dom/server.edge")`. Under the `react-server` condition that resolves to React's own
 * `react-dom/server.react-server.js`, which throws unconditionally at module top-level. vinext
 * groups every `node_modules/react-dom/*` module into one "framework" chunk for the RSC build, so
 * that throw runs whenever the framework chunk loads, crashing the worker on startup. This stub
 * keeps the dynamic import resolvable without pulling in the throwing module.
 */
export const renderToString = (): string => ""
