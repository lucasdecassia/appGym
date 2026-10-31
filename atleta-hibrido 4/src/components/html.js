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

export const zoneWithBpm = (profile, zoneId) => {
  const zone = ZONES.find((z) => z.id === zoneId);

  if (!zone) return zoneBadge(zoneId);

  return `
    <div class="zone-info">
      <div class="zone-info-header">
        ${zoneBadge(zoneId)}
        <span class="bpm">${bpmText(profile, zoneId)}</span>
      </div>

      <div class="zone-pace">
        <span class="zone-pace-label">Pace médio</span>
        <strong>${esc(zone.pace || "Não definido")}</strong>
      </div>
    </div>
  `;
};

export const allZonesWithBpm = (profile) => ZONES.map((z) => zoneWithBpm(profile, z.id)).join("");

export const progressBar = (percent) => `<div class="bar" style="margin:10px 0 6px"><i style="width:${percent}%"></i></div>`;

export const doneButton = (key, done, labelOn, labelOff) =>
  `<button class="btn${done ? " done" : ""}" data-act="done" data-v="${esc(key)}">${done ? labelOn : labelOff}</button>`;
