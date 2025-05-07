import { build } from "esbuild"
import { glob } from "glob"
import { execSync } from "child_process"
import fs from "fs"

// Find all TypeScript files in src directory
const entryPoints = await glob("src/**/*.{ts,tsx}")

// Build ESM version
try {
  await build({
    entryPoints,
    outdir: "dist/esm",
    bundle: false,
    format: "esm",
    outExtension: { ".js": ".mjs" },
    sourcemap: true,
    minify: true,
    target: "es2020",
  })
  console.log("✅ ESM build complete")
} catch (error) {
  console.error("❌ ESM build failed:", error)
  process.exit(1)
}

// Build CJS version
try {
  await build({
    entryPoints,
    outdir: "dist/cjs",
    bundle: false,
    format: "cjs",
    sourcemap: true,
    minify: true,
    target: "es2020",
  })
  console.log("✅ CJS build complete")
} catch (error) {
  console.error("❌ CJS build failed:", error)
  process.exit(1)
}

// Build bundled version (for CDN usage)
try {
  await build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/bundle.js",
    bundle: true,
    format: "esm",
    sourcemap: true,
    minify: true,
    target: "es2020",
    external: ["react", "react-dom", "react-intersection-observer"],
  })
  console.log("✅ Bundle build complete")
} catch (error) {
  console.error("❌ Bundle build failed:", error)
  process.exit(1)
}

// Generate type definitions using a temporary tsconfig file
console.log("Generating type definitions...")

// Create a temporary tsconfig specifically for declaration generation
const tempTsConfigPath = "tsconfig.build.json"
const tsConfig = {
  compilerOptions: {
    target: "es2020",
    module: "esnext",
    lib: ["dom", "esnext"],
    jsx: "react",
    declaration: true,
    declarationDir: "dist/types",
    emitDeclarationOnly: true,
    outDir: "dist/types",
    strict: true,
    moduleResolution: "node",
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true
  },
  include: ["src/**/*"],
  exclude: ["node_modules", "dist", "examples", "tests"]
}

fs.writeFileSync(tempTsConfigPath, JSON.stringify(tsConfig, null, 2))

try {
  // Use execSync to get immediate output and error messages
  execSync("npx tsc -p tsconfig.build.json", { stdio: "inherit" })
  console.log("✅ Type definitions generated")
} catch (error) {
  console.error("❌ Type generation failed")
  // Error details will be shown by stdio: "inherit"
} finally {
  // Clean up the temporary tsconfig
  fs.unlinkSync(tempTsConfigPath)
}

console.log("✅ All builds completed")
