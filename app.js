/* =========================================================
   Officiant invite (Traitors edition): auth, envelope, confetti
   ========================================================= */

// SHA-256 of the passcode. Default passcode is "traitor". Change it before sharing:
//   terminal:  echo -n 'yourpasscode' | shasum -a 256
//   browser:   getHash('yourpasscode')   (in the dev-tools console)
const TARGET_HASH = "5ace27c86f21a451716116d6f10eef981b82f404973111cf38446a77f14ca1d9";

const SESSION_KEY = "the-turret-unlocked";

/* ---------- Hashing ---------- */
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Console helper: getHash('newpasscode') -> prints and returns the hash
window.getHash = async function getHash(pw) {
  const hash = await sha256(String(pw).trim().toLowerCase());
  console.log(`TARGET_HASH for "${pw}":\n${hash}`);
  return hash;
};

/* ---------- Session storage (guarded) ---------- */
function isUnlocked() {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}
function rememberUnlock() {
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* private mode: fine */ }
}

/* ---------- Gatekeeper ---------- */
const gate = document.getElementById("gate");
const form = document.getElementById("gate-form");
const input = document.getElementById("passcode");
const errorEl = document.getElementById("gate-error");
const site = document.getElementById("site");

function unlock({ instant = false } = {}) {
  document.body.classList.remove("is-locked");
  site.setAttribute("aria-hidden", "false");
  if (instant) {
    gate.remove();
  } else {
    gate.classList.add("is-leaving");
    gate.addEventListener("transitionend", () => gate.remove(), { once: true });
    setTimeout(() => gate.isConnected && gate.remove(), 1200); // fallback
  }
}

function rejectAttempt(message) {
  errorEl.textContent = message;
  input.classList.add("is-invalid");
  form.classList.remove("is-shaking");
  void form.offsetWidth; // restart animation
  form.classList.add("is-shaking");
  input.select();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const attempt = input.value.trim().toLowerCase(); // forgiving: case + spaces

  if (!attempt) {
    rejectAttempt("Type the passcode first.");
    return;
  }
  if (!window.crypto || !crypto.subtle) {
    rejectAttempt("This browser can’t check the passcode. Open the link over https.");
    return;
  }

  const hash = await sha256(attempt);
  if (hash === TARGET_HASH) {
    errorEl.textContent = "";
    rememberUnlock();
    unlock();
  } else {
    rejectAttempt("Spoken like a Faithful. Try again.");
  }
});

input.addEventListener("input", () => {
  input.classList.remove("is-invalid");
  errorEl.textContent = "";
});

if (isUnlocked()) {
  unlock({ instant: true });
} else {
  input.focus();
}

/* ---------- Top bar drops down after the hero ---------- */
const topbar = document.getElementById("topbar");
const hero = document.querySelector(".hero");
if ("IntersectionObserver" in window && hero) {
  new IntersectionObserver(([entry]) => {
    topbar.classList.toggle("is-shown", !entry.isIntersecting);
  }, { threshold: 0.15 }).observe(hero);
}

/* ---------- Envelope ---------- */
const envelope = document.getElementById("envelope");
const envelopeWrap = document.getElementById("envelope-wrap");
const letter = document.getElementById("letter");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

envelope.addEventListener("click", () => {
  if (envelope.classList.contains("is-opening")) return;
  envelope.classList.add("is-opening");
  const showLetter = () => {
    envelopeWrap.hidden = true;
    letter.hidden = false;
    document.getElementById("letter-title").focus({ preventScroll: true });
    letter.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };
  if (reduceMotion) { showLetter(); return; }
  setTimeout(() => envelopeWrap.classList.add("is-gone"), 900);
  setTimeout(showLetter, 1400);
});

/* ---------- Confetti ---------- */
const PALETTE = ["#6e1219", "#a3242d", "#c9a24a", "#e6c97a", "#ece2cc", "#1a1412"];

// A few black hearts in the mix, to match the sign-off (canvas-confetti 1.9+)
const HEARTS = typeof window.confetti?.shapeFromText === "function"
  ? [confetti.shapeFromText({ text: "🖤", scalar: 2 })]
  : null;

function celebrate() {
  if (typeof window.confetti !== "function") return;

  if (reduceMotion) {
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 }, colors: PALETTE, disableForReducedMotion: false });
    return;
  }

  // Opening volley from the center, then a burst of black hearts
  confetti({ particleCount: 160, spread: 100, startVelocity: 55, origin: { y: 0.7 }, colors: PALETTE });
  if (HEARTS) {
    confetti({ particleCount: 28, spread: 110, startVelocity: 45, origin: { y: 0.7 }, shapes: HEARTS, scalar: 2, flat: true });
  }

  // Side cannons for ~4 seconds
  const end = Date.now() + 4000;
  (function cannons() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: PALETTE });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: PALETTE });
    if (Date.now() < end) requestAnimationFrame(cannons);
  })();

  // Fireworks bursts across the sky
  let bursts = 0;
  const timer = setInterval(() => {
    confetti({
      particleCount: 70,
      spread: 360,
      startVelocity: 30,
      ticks: 90,
      gravity: 0.8,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.3 },
      colors: PALETTE,
    });
    if (++bursts >= 6) clearInterval(timer);
  }, 550);
}

/* ---------- Acceptance + state lock ---------- */
const choices = document.querySelectorAll("#choices .btn");
const confirmation = document.getElementById("confirmation");

const confirmationMain = document.getElementById("confirmation-main");
const REPLIES = {
  yes: "Welcome to the turret, Chris.",
  nochoice: "You don’t. Welcome to the turret, Chris.",
};

choices.forEach((btn) => {
  btn.addEventListener("click", () => {
    choices.forEach((b) => (b.disabled = true));
    btn.classList.add("is-chosen");
    confirmationMain.textContent = REPLIES[btn.dataset.answer] || REPLIES.yes;
    confirmation.hidden = false;
    celebrate();
  });
});
