import { build } from "https://deno.land/x/esbuild@v0.24.0/mod.js";
import { ensureDir, copy } from "https://deno.land/std@0.170.0/fs/mod.ts";
import { join, normalize } from "https://deno.land/std@0.170.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.170.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.170.0/path/mod.ts";

const srcDir = Deno.realPathSync("./src");
const distDir = "./dist";
const staticDir = `${srcDir}/static`;


// Helper function to normalize paths
function normalizePath(path: string): string {
  return normalize(path).replace(/\\/g, "/"); // Replace backslashes with forward slashes
}

// Ensure the output directory exists
await ensureDir(distDir);

// Array to store challenge data for output
const challengesData: Array<{
  day: string;
  part: string;
  inputs: Array<{ name: string; path: string }>;
}> = [];

// Step 1: Bundle the browser_runner.ts files
console.log("Bundling TypeScript files...");

for await (const dirEntry of walk(`${srcDir}/challenges`, { maxDepth: 1, includeDirs: true })) {
  if (dirEntry.isDirectory && dirEntry.path !== `${srcDir}/challenges`) {
    const day = dirEntry.name; // e.g., "00", "01"
    const parts = ["part1", "part2"];
    for (const part of parts) {
      const partFile = join(dirEntry.path, `${part}.ts`);
      const outFile = join(distDir, "challenges", day, `${part}.js`);

      if (await exists(partFile)) {
        const outputDir = dirname(outFile); // Correctly extract the directory
        console.log("File:", partFile, "Dir:", outputDir);

        await ensureDir(outputDir); // Ensure the output directory exists

        await build({
          entryPoints: [partFile],
          bundle: true,
          outfile: normalizePath(outFile),
          minify: true,
          format: "esm",
          target: ["es6"],
          sourcemap: true,
          platform: "browser",
        });
        console.log(`Bundled: ${partFile} -> ${outFile}`);

        // Generate inputs for this part
        const inputs: Array<{ name: string; path: string }> = [];
        const inputsDir = join(dirEntry.path, "inputs");
        if (await exists(inputsDir)) {
          for await (const inputEntry of walk(inputsDir, { maxDepth: 1 })) {
            if (inputEntry.isFile) {
              const inputName = inputEntry.name;
              const inputPath = normalizePath(
                `./challenges/${day}/inputs/${inputName}`
              );
              if (
                (part === "part1" && inputName.includes(".part1.txt")) ||
                (part === "part2" && inputName.includes(".part2.txt")) ||
                (!inputName.includes(".part1.txt") && !inputName.includes(".part2.txt"))
              ) {
                inputs.push({ name: inputName.replace('.part1.txt', '.txt').replace('.part2.txt', '.txt'), path: inputPath });
              }
            }
          }
        }

        // Add challenge data
        challengesData.push({
          day,
          part,
          inputs,
        });
      }
    }
  }
}

// Step 2: Copy static files to /dist
console.log("Copying static files...");
await copy(`${staticDir}/index.html`, `${distDir}/index.html`, {
  overwrite: true,
});
await copy(`${staticDir}/tailwind_3.4.15.js`, `${distDir}/tailwind_3.4.15.js`, {
  overwrite: true,
});
console.log("Copied static files.");

// Step 3: Copy input directories
console.log("Copying input directories...");
for await (const entry of walk(`${srcDir}/challenges`, {
  includeDirs: true,
  match: [/inputs$/],
})) {
  const absoluteSrcPath = Deno.realPathSync(entry.path); // Normalize to absolute path
  const relativePath = absoluteSrcPath.replace(srcDir, ""); // Get relative path
  const destination = normalizePath(`${distDir}${relativePath}`);
  await ensureDir(destination); // Ensure destination directory exists
  await copy(entry.path, destination, { overwrite: true }); // Copy directory
  console.log(`Copied: ${entry.path} -> ${destination}`);
}

// Step 4: Write challengesData to a .js file
const jsOutputPath = join(distDir, "challenges.js");
const jsContent = `const challenges = ${JSON.stringify(
  challengesData,
  null,
  2
)};\nexport default challenges;`;
await Deno.writeTextFile(jsOutputPath, jsContent);
console.log(`Generated challenges.js at ${jsOutputPath}`);

console.log("Build complete.");
Deno.exit();

// Helper function to check if a file or directory exists
async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

