// CSV seguro: aspas escapadas e proteção contra "injeção de fórmula" ao abrir em planilhas.
function cell(value) {
  if (value == null) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text) && Number.isNaN(Number(text))) text = `'${text}`;
  return /[",\n\r;]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** columns: [{ key, label }] — retorna texto com BOM para o Excel reconhecer UTF-8. */
export function toCsv(rows, columns) {
  const header = columns.map((c) => cell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => cell(row[c.key])).join(","));
  return `\uFEFF${[header, ...lines].join("\r\n")}\r\n`;
}
