/* =========================================================
   Officiant invite (Traitors edition)
   Gate, parallax scene, chapter candles, Round Table game,
   dossier, assessment, hold-to-break seal, sign and seal.
   ========================================================= */

// SHA-256 of the passcode. Default passcode is "traitor". Change it before sharing:
//   terminal:  echo -n 'yourpasscode' | shasum -a 256
//   browser:   getHash('yourpasscode')   (in the dev-tools console)
const TARGET_HASH = "5ace27c86f21a451716116d6f10eef981b82f404973111cf38446a77f14ca1d9";
const SESSION_KEY = "the-turret-unlocked";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const buzz = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch { /* not supported */ } };

/* ---------- Hashing ---------- */
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
window.getHash = async function getHash(pw) {
  const hash = await sha256(String(pw).trim().toLowerCase());
  console.log(`TARGET_HASH for "${pw}":\n${hash}`);
  return hash;
};

/* ---------- Session storage (guarded) ---------- */
function isUnlocked() { try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; } }
function rememberUnlock() { try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* private mode */ } }

/* ---------- Gate ---------- */
const gate = $("#gate");
const form = $("#gate-form");
const input = $("#passcode");
const errorEl = $("#gate-error");
const site = $("#site");

function unlock({ instant = false } = {}) {
  document.body.classList.remove("is-locked");
  site.setAttribute("aria-hidden", "false");
  if (instant) { gate.remove(); return; }
  gate.classList.add("is-leaving");
  gate.addEventListener("transitionend", () => gate.remove(), { once: true });
  setTimeout(() => gate.isConnected && gate.remove(), 1200);
}

function rejectAttempt(message) {
  errorEl.textContent = message;
  input.classList.add("is-invalid");
  form.classList.remove("is-shaking");
  void form.offsetWidth;
  form.classList.add("is-shaking");
  input.select();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const attempt = input.value.trim().toLowerCase();
  if (!attempt) { rejectAttempt("Type the passcode first."); return; }
  if (!window.crypto || !crypto.subtle) { rejectAttempt("This browser can’t check the passcode. Open the link over https."); return; }
  if ((await sha256(attempt)) === TARGET_HASH) {
    errorEl.textContent = "";
    rememberUnlock();
    unlock();
  } else {
    rejectAttempt("Spoken like a Faithful. Try again.");
  }
});
input.addEventListener("input", () => { input.classList.remove("is-invalid"); errorEl.textContent = ""; });

if (isUnlocked()) unlock({ instant: true }); else input.focus();

/* ---------- Top bar + chapter candles ---------- */
const topbar = $("#topbar");
const hero = $(".hero");
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    topbar.classList.toggle("is-shown", !entry.isIntersecting);
  }, { threshold: 0.15 }).observe(hero);

  const candleLinks = $$("[data-candle]");
  const ids = candleLinks.map((a) => a.dataset.candle);
  let reached = -1;
  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const current = ids.indexOf(entry.target.id);
      reached = Math.max(reached, current);
      candleLinks.forEach((a, i) => {
        a.classList.toggle("is-lit", i <= reached);
        a.classList.toggle("is-current", i === current);
        if (i === current) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -60% 0px" });
  ids.forEach((id) => { const el = document.getElementById(id); if (el) chapterObserver.observe(el); });
}

/* ---------- Hero parallax (pointer, tilt and scroll) ---------- */
const layers = $$(".scene [data-depth]").map((g) => ({ g, d: parseFloat(g.dataset.depth) }));
if (!reduceMotion && layers.length) {
  const target = { x: 0, y: 0 };
  const now = { x: 0, y: 0 };
  let running = false;

  const apply = () => {
    const s = Math.min(window.scrollY, window.innerHeight);
    layers.forEach(({ g, d }) => {
      const x = -now.x * d * 46;
      const y = -now.y * d * 18 + s * (1 - d) * 0.35;
      g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    });
  };
  const loop = () => {
    now.x += (target.x - now.x) * 0.07;
    now.y += (target.y - now.y) * 0.07;
    apply();
    if (Math.abs(target.x - now.x) > 0.001 || Math.abs(target.y - now.y) > 0.001) {
      requestAnimationFrame(loop);
    } else { running = false; }
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = hero.getBoundingClientRect();
    target.x = (e.clientX - r.left) / r.width - 0.5;
    target.y = (e.clientY - r.top) / r.height - 0.5;
    kick();
  });
  hero.addEventListener("pointerleave", () => { target.x = 0; target.y = 0; kick(); });

  // Phone tilt where the browser allows it without a permission prompt (Android)
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null) return;
      target.x = Math.max(-0.5, Math.min(0.5, e.gamma / 50));
      target.y = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 80));
      kick();
    });
  }
  window.addEventListener("scroll", () => { if (window.scrollY < window.innerHeight * 1.2) kick(); }, { passive: true });
}

/* ---------- Confetti ---------- */
const PALETTE = ["#4a2763", "#6e3f96", "#c8b3e0", "#2f6a4c", "#f0e5cb", "#7a1622"];
const HEARTS = typeof window.confetti?.shapeFromText === "function"
  ? [confetti.shapeFromText({ text: "🖤", scalar: 2 })]
  : null;

function puff(originY = 0.6) {
  if (typeof window.confetti !== "function") return;
  confetti({ particleCount: 70, spread: 75, startVelocity: 38, origin: { y: originY }, colors: ["#2f6a4c", "#4a2763", "#c8b3e0"], disableForReducedMotion: true });
}

function celebrate() {
  if (typeof window.confetti !== "function") return;
  if (reduceMotion) {
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 }, colors: PALETTE, disableForReducedMotion: false });
    return;
  }
  confetti({ particleCount: 160, spread: 100, startVelocity: 55, origin: { y: 0.7 }, colors: PALETTE });
  if (HEARTS) confetti({ particleCount: 28, spread: 110, startVelocity: 45, origin: { y: 0.7 }, shapes: HEARTS, scalar: 2, flat: true });

  const end = Date.now() + 4000;
  (function cannons() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: PALETTE });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: PALETTE });
    if (Date.now() < end) requestAnimationFrame(cannons);
  })();

  let bursts = 0;
  const timer = setInterval(() => {
    confetti({
      particleCount: 70, spread: 360, startVelocity: 30, ticks: 90, gravity: 0.8,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.3 },
      colors: PALETTE,
    });
    if (++bursts >= 6) clearInterval(timer);
  }, 550);
}

/* ---------- Chapter I: the Round Table ---------- */
const seatsEl = $("#seats");
const foundEl = $("#found");
const feedback = $("#game-feedback");
const gameNext = $("#game-next");
const FAITHFUL_LINES = [
  "A Faithful. The table gasps.",
  "Faithful, and deeply offended.",
  "Wrong. That one was loyal all along.",
  "Another Faithful falls. Keep looking.",
];
let found = 0;
let misses = 0;

// Shuffle the seating so nobody can learn the order
const seatItems = [...seatsEl.children];
for (let i = seatItems.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [seatItems[i], seatItems[j]] = [seatItems[j], seatItems[i]];
}
seatItems.forEach((li) => seatsEl.appendChild(li));

$$(".seat", seatsEl).forEach((seat, i) => {
  seat.setAttribute("aria-label", `Unmask guest ${i + 1}`);
  seat.addEventListener("click", () => {
    if (seat.classList.contains("is-revealed")) return;
    const { role, name } = seat.dataset;
    const isTraitor = role === "traitor";
    seat.classList.add("is-revealed", isTraitor ? "is-traitor" : "is-faithful");
    seat.setAttribute("aria-disabled", "true");
    seat.setAttribute("aria-label", `${name}, ${isTraitor ? "Traitor" : "Faithful"}`);
    $(".seat-name", seat).innerHTML = `<strong></strong><em>${isTraitor ? "Traitor" : "Faithful"}</em>`;
    $(".seat-name strong", seat).textContent = name;

    if (isTraitor) {
      found += 1;
      foundEl.textContent = String(found);
      buzz([20, 40, 20]);
      if (found === 2) {
        feedback.textContent = misses === 0
          ? "Two for two, no Faithfuls harmed. You’re a natural."
          : "Both Traitors unmasked. Better than most contestants.";
        gameNext.hidden = false;
        puff(0.55);
      } else {
        feedback.textContent = `${name}. A Traitor. One more to find.`;
      }
    } else {
      feedback.textContent = FAITHFUL_LINES[misses % FAITHFUL_LINES.length];
      misses += 1;
      buzz(15);
    }
  });
});

/* ---------- Chapter II: the dossier ---------- */
$$(".redact").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dd = btn.closest("dd");
    const secret = $(".secret", dd);
    dd.classList.add("is-revealed");
    secret.removeAttribute("aria-hidden");
    secret.setAttribute("tabindex", "-1");
    secret.focus({ preventScroll: true });
    buzz(10);
    setTimeout(() => btn.remove(), reduceMotion ? 0 : 700);
  });
});

/* ---------- Chapter III: the assessment ---------- */
const questions = $$("#quiz .q");
const verdict = $("#verdict");
questions.forEach((q, i) => {
  const answers = $$(".q-answers .btn", q);
  answers.forEach((btn) => {
    btn.addEventListener("click", () => {
      answers.forEach((b) => (b.disabled = true));
      btn.classList.add("is-chosen");
      $(".q-reply", q).textContent = btn.dataset.reply || "Noted.";
      q.classList.remove("is-current");
      q.classList.add("is-done");
      const next = questions[i + 1];
      setTimeout(() => {
        const el = next || verdict;
        if (next) next.classList.add("is-current"); else verdict.hidden = false;
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
        const focusable = next ? $(".btn", next) : $(".next-link", verdict);
        focusable && focusable.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 750);
    });
  });
});

/* ---------- Chapter IV: hold to break the seal ---------- */
const seal = $("#seal");
const ring = $(".seal-ring circle", seal);
const sealHint = $("#seal-hint");
const envelope = $("#envelope");
const envelopeWrap = $("#envelope-wrap");
const letter = $("#letter");
const HOLD_MS = 900;
let progress = 0;
let holding = false;
let opened = false;
let holdStart = 0;

const setProgress = (p) => { progress = p; ring.style.strokeDashoffset = String(1 - p); };

function holdStep(t) {
  if (!holding || opened) return;
  const p = Math.min((t - holdStart) / HOLD_MS, 1);
  setProgress(p);
  if (p >= 1) { breakSeal(); return; }
  requestAnimationFrame(holdStep);
}

function releaseHold() {
  if (!holding || opened) return;
  holding = false;
  seal.classList.remove("is-pressing");
  if (progress > 0.05) sealHint.textContent = "Keep holding. It’s good wax.";
  const from = progress;
  const t0 = performance.now();
  (function drain(t) {
    if (holding || opened) return;
    const p = Math.max(from - ((t - t0) / 350) * from, 0);
    setProgress(p);
    if (p > 0) requestAnimationFrame(drain);
  })(t0);
}

seal.addEventListener("pointerdown", (e) => {
  if (opened || e.button > 0) return;
  e.preventDefault();
  try { seal.setPointerCapture(e.pointerId); } catch { /* fine */ }
  holding = true;
  seal.classList.add("is-pressing");
  holdStart = performance.now() - progress * HOLD_MS;
  buzz(10);
  requestAnimationFrame(holdStep);
});
["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => seal.addEventListener(type, releaseHold));
seal.addEventListener("contextmenu", (e) => e.preventDefault());
// Keyboard (Enter / Space) opens straight away
seal.addEventListener("click", (e) => { if (e.detail === 0) breakSeal(); });

function breakSeal() {
  if (opened) return;
  opened = true;
  holding = false;
  setProgress(1);
  seal.classList.remove("is-pressing");
  seal.classList.add("is-broken");
  seal.setAttribute("aria-disabled", "true");
  envelope.classList.add("is-open");
  sealHint.textContent = "";
  buzz([30, 30, 60]);

  const showLetter = () => {
    envelopeWrap.hidden = true;
    letter.hidden = false;
    sizeCanvas();
    $("#letter-title").focus({ preventScroll: true });
    letter.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };
  if (reduceMotion) { showLetter(); return; }
  setTimeout(() => envelopeWrap.classList.add("is-gone"), 1250);
  setTimeout(showLetter, 1750);
}

/* ---------- Sign and seal ---------- */
const accept = $("#accept");
const canvas = $("#sign-canvas");
const ctx = canvas.getContext("2d");
const nameInput = $("#sign-name");
const clearBtn = $("#sign-clear");
const sealAnswer = $("#seal-answer");
const noChoice = $("#no-choice");
const noChoiceReply = $("#no-choice-reply");
const stampSlot = $("#stamp-slot");
const confirmation = $("#confirmation");
const INK = "#231a13";
let handInk = false;
let drawing = false;
let last = null;

function sizeCanvas() {
  const r = canvas.getBoundingClientRect();
  if (!r.width) return;
  const keep = handInk ? canvas.toDataURL() : null;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  if (keep) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
    img.src = keep;
  } else if (nameInput.value.trim()) {
    writeTypedName();
  }
}
window.addEventListener("resize", () => { if (!letter.hidden) sizeCanvas(); });

function clearPad() {
  const r = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, r.width, r.height);
}

function writeTypedName() {
  clearPad();
  const name = nameInput.value.trim();
  if (!name) return;
  const r = canvas.getBoundingClientRect();
  let size = 44;
  ctx.font = `700 ${size}px UnifrakturCook, "IM Fell English", Georgia, serif`;
  while (ctx.measureText(name).width > r.width - 40 && size > 18) {
    size -= 2;
    ctx.font = `700 ${size}px UnifrakturCook, "IM Fell English", Georgia, serif`;
  }
  ctx.fillText(name, 24, r.height - 30);
}

function updateSealButton() {
  sealAnswer.disabled = !(handInk || nameInput.value.trim());
}

const pos = (e) => {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
};

canvas.addEventListener("pointerdown", (e) => {
  if (accept.classList.contains("is-sealed")) return;
  e.preventDefault();
  try { canvas.setPointerCapture(e.pointerId); } catch { /* fine */ }
  if (!handInk && nameInput.value.trim()) { nameInput.value = ""; clearPad(); }
  drawing = true;
  last = pos(e);
});
canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  const p = pos(e);
  const dist = Math.hypot(p.x - last.x, p.y - last.y);
  const speed = dist / Math.max(p.t - last.t, 1);
  ctx.lineWidth = Math.max(1.3, Math.min(3.4, 3.6 - speed * 1.4));
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  last = p;
  if (!handInk) { handInk = true; updateSealButton(); }
});
["pointerup", "pointercancel", "lostpointercapture"].forEach((type) =>
  canvas.addEventListener(type, () => { drawing = false; })
);

clearBtn.addEventListener("click", () => {
  clearPad();
  handInk = false;
  nameInput.value = "";
  updateSealButton();
});

nameInput.addEventListener("input", () => {
  if (handInk) { handInk = false; }
  writeTypedName();
  updateSealButton();
});

noChoice.addEventListener("click", () => {
  noChoiceReply.textContent = "You don’t. But we love that you asked.";
  noChoice.hidden = true;
  $(".sign-pad").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
});

sealAnswer.addEventListener("click", () => {
  if (sealAnswer.disabled) return;
  accept.classList.add("is-sealed");
  nameInput.disabled = true;
  sealAnswer.disabled = true;
  stampSlot.innerHTML = '<svg viewBox="0 0 120 120"><use href="#crest"/></svg>';
  setTimeout(() => {
    buzz([40, 30, 80]);
    confirmation.hidden = false;
    celebrate();
  }, reduceMotion ? 0 : 420);
});
