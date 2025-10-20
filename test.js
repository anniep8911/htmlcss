import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 현재 실행 위치 기준 경로 처리
const cwd = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputArg = process.argv[2] || "./";
const targetDir = path.resolve(cwd, inputArg);

if (!fs.existsSync(targetDir)) {
  console.error(`❌ 지정한 폴더가 존재하지 않습니다: ${targetDir}`);
  process.exit(1);
}

const HTML_EXT = new Set([".html", ".htm"]);
const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const TAG_RE =
  /<!DOCTYPE[^>]*>|<!--[\s\S]*?-->|<\/\s*([a-zA-Z0-9:-]+)\s*>|<\s*([a-zA-Z0-9:-]+)([^>]*?)\/?\s*>/g;

const EXCLUDE_SELECTORS = new Set([
  "html",
  "html>head",
  "html>body",
  "html>head>meta",
  "html>head>link",
  "html>head>style",
  "html>head>script",
  "html>body>style",
  "html>body>script",
]);

function cssEscape(str) {
  return str.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function pickSelectorSegment(tag, attrText) {
  let seg = tag.toLowerCase();
  if (!attrText) return seg;

  const idMatch = attrText.match(/\bid\s*=\s*["']([^"']+)["']/i);
  if (idMatch) seg += `#${cssEscape(idMatch[1])}`;

  const classMatch = attrText.match(/\bclass\s*=\s*["']([^"']+)["']/i);
  if (classMatch) {
    const classes = classMatch[1]
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => `.${cssEscape(c)}`)
      .join("");
    seg += classes;
  }
  return seg;
}

function extractSelectorsFromHtml(html) {
  const stack = [];
  const selectors = [];
  let m;

  while ((m = TAG_RE.exec(html))) {
    const [, closeTag, openTag, attrTextRaw] = m;
    if (!closeTag && !openTag) continue;

    if (closeTag) {
      const t = closeTag.toLowerCase();
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === t) {
          stack.splice(i);
          break;
        }
      }
      continue;
    }

    const tag = openTag.toLowerCase();
    const attrText = attrTextRaw || "";
    const seg = pickSelectorSegment(tag, attrText);
    stack.push({ tag, seg });

    const pathNow = stack.map((s) => s.seg).join(">");
    selectors.push(pathNow);

    const selfClosing = /\/\s*>$/.test(m[0]);
    if (selfClosing || VOID.has(tag)) stack.pop();
  }
  return selectors;
}

// 폴더 내 파일들
const entries = fs.readdirSync(targetDir, { withFileTypes: true });
const htmlFiles = entries.filter(
  (ent) => ent.isFile() && HTML_EXT.has(path.extname(ent.name).toLowerCase())
);
const totalFiles = htmlFiles.length;
if (totalFiles === 0) {
  console.log("/* No HTML files found. */");
  process.exit(0);
}

const selectorToFiles = new Map();

for (const ent of htmlFiles) {
  const filePath = path.join(targetDir, ent.name);
  const html = fs.readFileSync(filePath, "utf8");
  const selectors = extractSelectorsFromHtml(html);

  console.log(`/* ${ent.name} */`);
  for (const sel of selectors) console.log(`${sel}{}`);
  console.log();

  const uniqueInFile = new Set(selectors);
  for (const sel of uniqueInFile) {
    if (!selectorToFiles.has(sel)) selectorToFiles.set(sel, new Set());
    selectorToFiles.get(sel).add(ent.name);
  }
}

// ✅ 출력 완료 후 요약 바로 표시
process.on("beforeExit", () => {
  const repeated = [];
  for (const [sel, filesSet] of selectorToFiles.entries()) {
    if (EXCLUDE_SELECTORS.has(sel)) continue;
    const fileCount = filesSet.size;
    if (fileCount >= 2) {
      const pct = ((fileCount / totalFiles) * 100).toFixed(1);
      repeated.push({ selector: sel, fileCount, pct });
    }
  }

  repeated.sort(
    (a, b) => b.fileCount - a.fileCount || a.selector.localeCompare(b.selector)
  );

  console.log("\n/* Repeated selectors summary (excluding boilerplate) */");
  console.log(`/* Total files analyzed: ${totalFiles} */`);
  if (repeated.length === 0) {
    console.log("/* No repeated selectors found (after exclusions). */");
  } else {
    for (const r of repeated) {
      console.log(
        `${r.selector} — ${r.fileCount}/${totalFiles} files (${r.pct}%)`
      );
    }
  }
});
