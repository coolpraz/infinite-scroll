import { build } from "esbuild"
import { glob } from "glob"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

// Ensure dist directory exists
if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist")
}

// Clean up existing dist directory
console.log("Cleaning dist directory...")
fs.rmSync("dist", { recursive: true, force: true })
fs.mkdirSync("dist")
fs.mkdirSync("dist/esm", { recursive: true })
fs.mkdirSync("dist/cjs", { recursive: true })

console.log("Building package...")

// Build ESM bundle
try {
  await build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/esm/index.mjs",
    bundle: true,
    format: "esm",
    sourcemap: true,
    minify: true,
    target: "es2020",
    platform: "neutral",
    jsx: "automatic",
    external: ["react", "react-dom", "react-intersection-observer"],
  })
  console.log("✅ ESM bundle complete")
} catch (error) {
  console.error("❌ ESM bundle failed:", error)
  process.exit(1)
}

// Build CJS bundle
try {
  await build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/cjs/index.js",
    bundle: true,
    format: "cjs",
    sourcemap: true,
    minify: true,
    target: "es2020",
    platform: "neutral",
    jsx: "automatic",
    external: ["react", "react-dom", "react-intersection-observer"],
  })
  console.log("✅ CJS bundle complete")
} catch (error) {
  console.error("❌ CJS bundle failed:", error)
  process.exit(1)
}

// Create package.json for ESM modules
const esmPackageJson = {
  "type": "module"
}
fs.writeFileSync("dist/esm/package.json", JSON.stringify(esmPackageJson, null, 2))

// Create package.json for CJS modules
const cjsPackageJson = {
  "type": "commonjs"
}
fs.writeFileSync("dist/cjs/package.json", JSON.stringify(cjsPackageJson, null, 2))

// Create main index.js file
const mainIndexContent = `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/index.js');
} else {
  module.exports = require('./cjs/index.js');
}
`;
fs.writeFileSync("dist/index.js", mainIndexContent);

// Generate type definitions
console.log("Generating type definitions...")

// Create a temporary tsconfig specifically for declaration generation
const tempTsConfigPath = "tsconfig.build.json"
const tsConfig = {
  compilerOptions: {
    target: "es2020",
    module: "esnext",
    lib: ["dom", "esnext"],
    jsx: "react-jsx",
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

  // Copy the type definitions to the root dist directory
  fs.copyFileSync("dist/types/index.d.ts", "dist/index.d.ts")
} catch (error) {
  console.error("❌ Type generation failed")
} finally {
  // Clean up the temporary tsconfig
  fs.unlinkSync(tempTsConfigPath)
}

console.log("✅ All builds completed")
