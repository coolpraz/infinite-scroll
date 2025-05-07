import { build } from "esbuild"
import { glob } from "glob"
import { dtsPlugin } from "esbuild-plugin-d.ts"

// Find all TypeScript files in src directory
const entryPoints = await glob("src/**/*.{ts,tsx}")

// Build ESM version
await build({
  entryPoints,
  outdir: "dist/esm",
  bundle: false,
  sourcemap: true,
  minify: true,
  format: "esm",
  target: "es2020",
  plugins: [dtsPlugin()],
  outExtension: { ".js": ".mjs" },
})

// Build CJS version
await build({
  entryPoints,
  outdir: "dist/cjs",
  bundle: false,
  sourcemap: true,
  minify: true,
  format: "cjs",
  target: "es2020",
  plugins: [dtsPlugin()],
})

// Build bundled version (for CDN usage)
await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/bundle.js",
  bundle: true,
  sourcemap: true,
  minify: true,
  format: "esm",
  target: "es2020",
  external: ["react", "react-dom", "react-intersection-observer"],
})

console.log("✅ Build complete")
