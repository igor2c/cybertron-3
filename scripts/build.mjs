// Builds the theme.css that Obsidian installs from the readable source in src/theme.css.
//
//   npm run build
//
// Edit src/theme.css, never theme.css: the root file is generated and minified so it stays under
// the ~100 KB size that Obsidian's automated review recommends for themes.
import { transform } from "lightningcss";
import { readFileSync, writeFileSync } from "node:fs";

const SOURCE = "src/theme.css";
const OUTPUT = "theme.css";
const SIZE_LIMIT = 100_000; // bytes; larger themes get a "larger than recommended" warning

const HEADER =
  "/*! Cybertron 3 by igor2c, based on LYT Mode by Nick Milo. MIT License. " +
  "Readable source: src/theme.css at https://github.com/igor2c/cybertron-3 */\n";

const { code } = transform({
  filename: SOURCE,
  code: readFileSync(SOURCE),
  minify: true,
});

// Inside quoted SVG data URIs browsers accept literal < and >, so drop their escapes.
const css = code
  .toString()
  .replace(/url\("data:image\/svg\+xml,[^"]*"\)/g, (url) => url.replace(/%3C/gi, "<").replace(/%3E/gi, ">"));

const output = HEADER + css + "\n";
writeFileSync(OUTPUT, output);

const bytes = Buffer.byteLength(output);
console.log(`${OUTPUT}: ${bytes.toLocaleString("en-US")} bytes (limit ${SIZE_LIMIT.toLocaleString("en-US")})`);
if (bytes >= SIZE_LIMIT) {
  console.error(`${OUTPUT} is over the recommended size; Obsidian's review will flag it.`);
  process.exitCode = 1;
}
