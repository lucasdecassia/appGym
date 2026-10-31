import { ZONES } from "../data/plan.js";
import { zoneLabel, zoneCalibration } from "../lib/heartRate.js";

const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ENTITIES[c]);

export const zoneBadge = (zoneId) => `<span class="zone ${zoneId.toLowerCase()}">${zoneId}</span>`;

/** bpm sempre acompanhado do método: sem FCmáx medida a faixa é só uma estimativa. */
export const bpmText = (profile, zoneId) => `${zoneLabel(profile, zoneId)}${zoneCalibration(profile).calibrated ? "" : " (est.)"}`;

export const calibrationTag = (profile) => {
  const c = zoneCalibration(profile);
  return `<span class="tag${c.calibrated ? " ok" : ""}">${c.tag}</span>`;
};

export const zoneWithBpm = (profile, zoneId) =>
  `${zoneBadge(zoneId)}<span class="bpm" style="margin-right:6px">${bpmText(profile, zoneId)}</span>`;

export const allZonesWithBpm = (profile) => ZONES.map((z) => zoneWithBpm(profile, z.id)).join("");

export const progressBar = (percent) => `<div class="bar" style="margin:10px 0 6px"><i style="width:${percent}%"></i></div>`;

export const doneButton = (key, done, labelOn, labelOff) =>
  `<button class="btn${done ? " done" : ""}" data-act="done" data-v="${esc(key)}">${done ? labelOn : labelOff}</button>`;
