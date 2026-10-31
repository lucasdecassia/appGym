// Campos de formulário acessíveis (rótulo, erro com role="alert", rascunho preservado em caso de erro).
import { esc } from "./html.js";

const draftOf = (ui, form) => (ui.draft && ui.draft[form]) || {};
const errorOf = (ui, form, name) => (ui.errors && ui.errors[form] && ui.errors[form][name]) || "";
export const hasErrors = (ui, form) => Boolean(ui.errors && ui.errors[form] && Object.keys(ui.errors[form]).length);

const describe = (id, error) => (error ? ` aria-invalid="true" aria-describedby="${id}-err"` : "");
const errorHtml = (id, error) => (error ? `<div class="err" id="${id}-err" role="alert">${esc(error)}</div>` : "");

export function field(ui, form, name, label, { type = "text", fallback = "", attrs = "" } = {}) {
  const id = `${form}-${name}`;
  const error = errorOf(ui, form, name);
  const value = draftOf(ui, form)[name] ?? fallback;
  return `<div><label class="f" for="${id}">${esc(label)}</label><input class="in" id="${id}" data-f="${name}" type="${type}" value="${esc(value ?? "")}" ${attrs}${describe(id, error)}>${errorHtml(id, error)}</div>`;
}

export function select(ui, form, name, label, options, { fallback = "" } = {}) {
  const id = `${form}-${name}`;
  const error = errorOf(ui, form, name);
  const current = draftOf(ui, form)[name] ?? fallback;
  const opts = options.map((o) => `<option value="${esc(o.id)}"${String(o.id) === String(current) ? " selected" : ""}>${esc(o.label)}</option>`).join("");
  return `<div><label class="f" for="${id}">${esc(label)}</label><select class="in" id="${id}" data-f="${name}"${describe(id, error)}>${opts}</select>${errorHtml(id, error)}</div>`;
}

export function textarea(ui, form, name, label, { fallback = "", attrs = "" } = {}) {
  const id = `${form}-${name}`;
  const error = errorOf(ui, form, name);
  return `<div><label class="f" for="${id}">${esc(label)}</label><textarea class="in" id="${id}" data-f="${name}" ${attrs}${describe(id, error)}>${esc(draftOf(ui, form)[name] ?? fallback)}</textarea>${errorHtml(id, error)}</div>`;
}

export function checkbox(ui, form, name, label, { fallback = false } = {}) {
  const checked = draftOf(ui, form)[name] ?? fallback;
  return `<label class="check"><input type="checkbox" data-f="${name}"${checked ? " checked" : ""}> ${esc(label)}</label>`;
}

export const formAlert = (ui, form) => (hasErrors(ui, form) ? '<div class="banner err" role="alert">Corrija os campos destacados.</div>' : "");

export const rpeOptions = [{ id: "", label: "—" }, ...Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1), label: `${i + 1}` }))];
export const scaleOptions = [{ id: "", label: "—" }, ...Array.from({ length: 5 }, (_, i) => ({ id: String(i + 1), label: `${i + 1}` }))];
