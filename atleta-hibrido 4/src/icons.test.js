// Garante que ícones e logo referenciados pelo app existem, com as dimensões esperadas.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const here = (p) => new URL(p, import.meta.url);
const png = (p) => {
  const b = readFileSync(here(p));
  assert.equal(b.subarray(1, 4).toString(), "PNG", `${p} não é PNG`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), colorType: b[25] };
};

test("ícones do manifest existem e têm o tamanho declarado", () => {
  const manifest = JSON.parse(readFileSync(here("./manifest.webmanifest"), "utf8"));
  assert.ok(manifest.icons.length >= 3);
  for (const icon of manifest.icons) {
    const [w, h] = icon.sizes.split("x").map(Number);
    const { width, height } = png(`./${icon.src}`);
    assert.deepEqual([width, height], [w, h], icon.src);
  }
  assert.ok(manifest.icons.some((i) => i.purpose === "maskable"));
});

test("ícone do iOS e emblema do cabeçalho", () => {
  assert.deepEqual([png("./icons/apple-touch-icon.png").width, png("./icons/apple-touch-icon.png").height], [180, 180]);
  const mark = png("./icons/logo-mark.png");
  assert.equal(mark.height, 128);
  assert.equal(mark.colorType, 6, "emblema precisa de canal alfa (fundo transparente)");
});

test("index.html referencia os arquivos de logo que existem", () => {
  const html = readFileSync(here("./index.html"), "utf8");
  for (const [, file] of html.matchAll(/(?:src|href)="(icons\/[^"]+)"/g)) assert.ok(existsSync(here(`./${file}`)), file);
  assert.match(html, /class="logo-img"[^>]*alt=""/);
  assert.match(html, /apple-touch-icon\.png/);
  assert.match(html, /TREINO <b>HÍBRIDO<\/b>/);
});
