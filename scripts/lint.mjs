// Runs the same CSS checks as Obsidian's automated theme review (stylelint-config-obsidianmd),
// targeting Electron 28, which matches this theme's minAppVersion (Obsidian 1.5.8).
//
//   npm run lint
//
// Only the Obsidian-specific rules are reported, as in the review; the general formatting rules
// that the config inherits from stylelint-config-standard are ignored.
import stylelint from "stylelint";
import { readFileSync } from "node:fs";

const FILE = process.argv[2] ?? "theme.css";
const OBSIDIAN_RULES = new Set([
  "function-url-scheme-disallowed-list",
  "function-url-scheme-allowed-list",
  "declaration-no-important",
  "color-named",
  "declaration-block-no-duplicate-properties",
  "plugin/no-unsupported-browser-features",
  "selector-pseudo-class-disallowed-list",
  "selector-pseudo-class-no-unknown",
  "selector-pseudo-element-no-unknown",
  "selector-type-no-unknown",
  "at-rule-no-unknown",
  "unit-no-unknown",
  "property-disallowed-list",
]);

const { results } = await stylelint.lint({
  code: readFileSync(FILE, "utf8"),
  codeFilename: FILE,
  config: {
    extends: ["stylelint-config-obsidianmd"],
    rules: {
      "plugin/no-unsupported-browser-features": [
        true,
        { severity: "warning", browsers: ["electron >= 28"], ignore: ["css-nesting", "css-cascade-layers"] },
      ],
    },
  },
});

const findings = results[0].warnings.filter((w) => OBSIDIAN_RULES.has(w.rule));
for (const w of findings) console.log(`${FILE}:${w.line}:${w.column} ${w.severity} ${w.text}`);
console.log(`${findings.length} issue(s) found by Obsidian's review rules.`);
if (findings.length) process.exitCode = 1;
