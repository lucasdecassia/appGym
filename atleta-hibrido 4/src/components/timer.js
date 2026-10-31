import { formatClock } from "../lib/clock.js";

let endAt = 0;
let intervalId = null;
const el = (id) => document.getElementById(id);

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 350);
  } catch { /* sem áudio */ }
  try { navigator.vibrate?.([200, 100, 200]); } catch { /* sem vibração */ }
}

function stopLoop() {
  clearInterval(intervalId);
  intervalId = null;
}

function tick() {
  const left = (endAt - Date.now()) / 1000;
  if (left <= 0) {
    stopLoop();
    el("timer-clock").textContent = "Bora!";
    beep();
    setTimeout(() => { if (!intervalId) el("timer").hidden = true; }, 3000);
    return;
  }
  el("timer-clock").textContent = formatClock(left);
}

export function startTimer(seconds, label) {
  stopLoop();
  endAt = Date.now() + seconds * 1000;
  el("timer-label").textContent = `Descanso · ${label}`;
  el("timer").hidden = false;
  tick();
  intervalId = setInterval(tick, 250);
}

export function addTime(seconds) {
  if (!intervalId) return;
  endAt += seconds * 1000;
  tick();
}

export function stopTimer() {
  stopLoop();
  el("timer").hidden = true;
}
