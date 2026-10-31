// Build sem dependências: copia src/ para dist/ e prepara o service worker.
import { cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createHash } from "node:crypto";

const SRC = "src";
const DIST = "dist";

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

rmSync(DIST, { recursive: true, force: true });
cpSync(SRC, DIST, { recursive: true });

// Remove testes do pacote final.
for (const file of listFiles(DIST)) {
  if (file.endsWith(".test.js")) rmSync(file);
}

const files = listFiles(DIST).map((f) => relative(DIST, f).split("\\").join("/"));
const precache = ["./", ...files.filter((f) => f !== "sw.js").map((f) => `./${f}`)];

const hash = createHash("sha256");
for (const f of files.sort()) hash.update(f).update(readFileSync(join(DIST, f)));
const build = hash.digest("hex").slice(0, 10);

const swPath = join(DIST, "sw.js");
const sw = readFileSync(swPath, "utf8")
  .replace("/*PRECACHE*/ []", JSON.stringify(precache))
  .replace('/*BUILD*/ "dev"', JSON.stringify(build));
if (sw.includes("/*PRECACHE*/") || sw.includes("/*BUILD*/")) throw new Error("Marcadores do sw.js não substituídos");
writeFileSync(swPath, sw);

const indexPath = join(DIST, "index.html");
const html = readFileSync(indexPath, "utf8").replace('content="development"', 'content="production"');
if (!html.includes('content="production"')) throw new Error("Marcador app-env não substituído");
writeFileSync(indexPath, html);

console.log(`Build ${build}: ${files.length} arquivos em ${DIST}/`);
