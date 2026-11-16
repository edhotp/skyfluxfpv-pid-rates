import { actualRate, simulatePid } from "./labs.mjs";

const byId = (id) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Required page element is missing: ${id}`);
  return element;
};
const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const displayNumber = (value) => numberFormat.format(Math.abs(value) < 0.05 ? 0 : value);
const ratesDefaults = { center: 160, maxRate: 720, expo: 0.45 };
let comparison = null;

function readRates() {
  return {
    center: Number(byId("center").value),
    maxRate: Number(byId("max-rate").value),
    expo: Number(byId("expo").value),
  };
}

function ratePath(settings) {
  const points = [];
  for (let step = 0; step <= 200; step += 1) {
    const stick = step / 100 - 1;
    const x = 56 + step / 200 * 558;
    const y = 164 - actualRate(stick, settings) / 1200 * 140;
    points.push(`${step ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

function updateRates() {
  const settings = readRates();
  const stick = Number(byId("stick").value) / 100;
  const rate = actualRate(stick, settings);
  byId("center-value").textContent = settings.center;
  byId("max-rate-value").textContent = `${settings.maxRate}\u00b0/s`;
  byId("expo-value").textContent = settings.expo.toFixed(2);
  byId("stick-value").textContent = `${stick > 0 ? "+" : ""}${Math.round(stick * 100)}%`;
  byId("rate-result").textContent = displayNumber(rate);
  byId("rate-curve").setAttribute("d", ratePath(settings));
  byId("comparison-curve").setAttribute("d", comparison ? ratePath(comparison) : "");
  const x = 335 + stick * 279;
  const y = 164 - rate / 1200 * 140;
  byId("rate-point").setAttribute("cx", x);
  byId("rate-point").setAttribute("cy", y);
  byId("rate-crosshair").setAttribute("d", `M${x},164V${y}H335`);
  for (const position of [25, 50, 75, 100]) {
    byId(`rate-at-${position}`).textContent = displayNumber(actualRate(position / 100, settings));
  }
  byId("rotation-time").textContent = Math.abs(rate) > 0.05
    ? `Pada laju tetap ${displayNumber(Math.abs(rate))}\u00b0/s, 360\u00b0 memerlukan sekitar ${displayNumber(360 / Math.abs(rate))} detik. Tanpa waktu akselerasi.`
    : "Stick tengah: target laju nol. Di Acro, ini tidak berarti kembali rata.";
}

function updatePid() {
  const settings = {
    p: Number(byId("gain-p").value),
    i: Number(byId("gain-i").value),
    d: Number(byId("gain-d").value),
    disturbance: byId("disturbance").checked,
  };
  byId("gain-p-value").textContent = settings.p.toFixed(1);
  byId("gain-i-value").textContent = settings.i.toFixed(1);
  byId("gain-d-value").textContent = settings.d.toFixed(2);
  const samples = simulatePid(settings);
  const maxResponse = Math.max(...samples.map((sample) => sample.velocity));
  const minResponse = Math.min(...samples.map((sample) => sample.velocity));
  const high = Math.max(1.5, Math.ceil(maxResponse * 2) / 2);
  const low = Math.min(-0.1, Math.floor(minResponse * 10) / 10 - 0.1);
  const y = (value) => 304 - (value - low) / (high - low) * 280;
  const path = (field) => samples.filter((_, index) => index % 5 === 0).map((sample, index) =>
    `${index ? "L" : "M"}${(56 + sample.time / 6 * 558).toFixed(2)},${y(sample[field]).toFixed(2)}`,
  ).join(" ");
  byId("pid-response").setAttribute("d", path("velocity"));
  byId("pid-target").setAttribute("d", path("target"));
  const labels = byId("pid-chart").querySelectorAll(".chart-text text");
  const ticks = Array.from({ length: 4 }, (_, index) => high * (1 - index / 3));
  for (let index = 0; index < ticks.length; index += 1) {
    const value = ticks[index];
    labels[index].textContent = `${Math.round(value * 100)}%`;
    labels[index].setAttribute("y", y(value) + 4);
  }
  byId("pid-chart").querySelector(".chart-grid path").setAttribute("d",
    `${ticks.map((value) => `M56 ${y(value)}H614`).join(" ")} M56 24V304M149 24V304M242 24V304M335 24V304M428 24V304M521 24V304M614 24V304`,
  );
  byId("pid-peak").textContent = `${displayNumber(maxResponse * 100)}%`;
  byId("pid-error").textContent = `${displayNumber((1 - samples.at(-1).velocity) * 100)}%`;
  byId("pid-disturbance").textContent = settings.disturbance ? "Aktif mulai 3 dtk" : "Tidak aktif";
}

function initProgress() {
  const storageKey = "skyflux-pid-rates.progress.v1";
  const completed = new Set();
  let storageAvailable = true;
  const notify = (message) => {
    byId("storage-notice").hidden = false;
    byId("storage-notice").textContent = message;
  };
  const unavailable = (error) => {
    if (!(error instanceof DOMException) || !["SecurityError", "QuotaExceededError"].includes(error.name)) {
      throw error;
    }
    storageAvailable = false;
    console.warn("SkyFluxFPV: progress storage unavailable.", error);
    notify("Penyimpanan browser tidak tersedia. Progres hanya berlaku selama halaman ini terbuka.");
  };
  let raw = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch (error) {
    unavailable(error);
  }
  if (raw !== null) {
    try {
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved) || !saved.every((id) => Number.isInteger(id) && id >= 1 && id <= 6)) {
        throw new SyntaxError("Invalid saved course progress");
      }
      saved.forEach((id) => completed.add(id));
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      console.warn("SkyFluxFPV: saved progress is invalid.", error);
      notify("Data progres lama tidak valid. Progres ditampilkan dari awal; klik tombol episode untuk menyimpan ulang.");
    }
  }
  const update = () => {
    byId("course-progress").value = completed.size;
    byId("course-progress").textContent = `${completed.size} dari 6 episode`;
    byId("progress-label").textContent = `${completed.size} / 6`;
    document.querySelectorAll("[data-complete]").forEach((button) => {
      const id = Number(button.dataset.complete);
      const done = completed.has(id);
      button.setAttribute("aria-pressed", String(done));
      button.textContent = done ? `Episode 0${id} dipahami \u2713` : `Saya paham episode 0${id}`;
    });
  };
  document.querySelectorAll("[data-complete]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", () => {
      const id = Number(button.dataset.complete);
      if (completed.has(id)) completed.delete(id);
      else completed.add(id);
      update();
      if (storageAvailable) {
        try {
          localStorage.setItem(storageKey, JSON.stringify([...completed]));
        } catch (error) {
          unavailable(error);
        }
      }
    });
  });
  update();
}

const answers = {
  q1: { answer: "a", explanation: "Di Acro, center meminta laju putar mendekati nol. Berhenti berputar tidak sama dengan kembali rata.", episode: 1 },
  q2: { answer: "b", explanation: "D bekerja dari perubahan gyro. Noise berfrekuensi tinggi perlu ditangani dengan mekanik dan filtering yang sesuai; D berlebihan dapat meningkatkan panas.", episode: 2 },
  q3: { answer: "c", explanation: "Pada Actual, Expo mengubah transisi kurva, bukan center slope dan endpoint. Ini tidak berlaku identik untuk semua model rate.", episode: 3 },
  q4: { answer: "a", explanation: "Model Actual, Betaflight, Quick, KISS, dan Raceflight memakai hubungan matematis berbeda. Catat jenis model bersama nilai per sumbu.", episode: 4 },
  q5: { answer: "b", explanation: "Bounceback bukan diagnosis tunggal. Periksa kondisi fisik, konfigurasi, dan log sebelum memutuskan tindakan.", episode: 5 },
  q6: { answer: "c", explanation: "Lepas propeller saat setup. Jangan arm dengan propeller kecuali bermaksud terbang di lokasi aman.", episode: 6 },
};

function initQuiz() {
  const form = byId("quiz-form");
  let graded = false;
  const clearFeedback = (message) => {
    document.querySelectorAll(".quiz-feedback").forEach((feedback) => {
      feedback.hidden = true;
      feedback.textContent = "";
      feedback.classList.remove("incorrect");
    });
    byId("quiz-result").textContent = message;
    graded = false;
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    let score = 0;
    for (const [question, item] of Object.entries(answers)) {
      const correct = data.get(question) === item.answer;
      if (correct) score += 1;
      const feedback = byId(`feedback-${question}`);
      feedback.hidden = false;
      feedback.classList.toggle("incorrect", !correct);
      feedback.textContent = `${correct ? "Benar." : "Belum tepat."} ${item.explanation} Rujuk episode 0${item.episode}.`;
    }
    byId("quiz-result").textContent = `${score} / 6 benar. ${score === 6 ? "Mantap! Kamu sudah membedakan rate dan kontrol. Ini bukan sertifikasi keselamatan terbang." : "Baca penjelasan di setiap soal, lalu ulangi episode yang sesuai."}`;
    byId("quiz-result").focus();
    graded = true;
  });
  form.addEventListener("reset", () => clearFeedback("Kuis diulang. Pilih jawaban, lalu periksa kembali."));
  form.addEventListener("change", () => {
    if (graded) clearFeedback("Jawaban berubah. Periksa kembali untuk mendapatkan hasil terbaru.");
  });
}

function initNavigation() {
  const menu = document.querySelector(".menu-toggle");
  const nav = byId("main-nav");
  const closeMenu = () => {
    nav.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
  };
  menu.hidden = false;
  menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(expanded));
    nav.classList.toggle("is-open", expanded);
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });
  document.querySelectorAll("[data-open-episode]").forEach((link) => {
    link.addEventListener("click", () => {
      const episode = byId(`episode-${link.dataset.openEpisode}`);
      episode.open = true;
      episode.querySelector("summary").focus({ preventScroll: true });
    });
  });
  const openHashEpisode = () => {
    if (/^#episode-[1-6]$/.test(location.hash)) {
      const episode = byId(location.hash.slice(1));
      episode.open = true;
    }
  };
  window.addEventListener("hashchange", openHashEpisode);
  openHashEpisode();
}

["center", "max-rate", "expo", "stick"].forEach((id) => byId(id).addEventListener("input", updateRates));
byId("reset-rates").addEventListener("click", () => {
  byId("center").value = ratesDefaults.center;
  byId("max-rate").value = ratesDefaults.maxRate;
  byId("expo").value = ratesDefaults.expo;
  byId("stick").value = 50;
  comparison = null;
  byId("comparison-status").textContent = "Lab dikembalikan ke contoh awal. Pembanding dihapus.";
  updateRates();
});
byId("save-comparison").addEventListener("click", () => {
  comparison = readRates();
  byId("comparison-status").textContent = `Tersimpan: Center ${comparison.center}, Max ${comparison.maxRate}, Expo ${comparison.expo.toFixed(2)}. Garis putus-putus menunjukkan pembanding.`;
  updateRates();
});
["gain-p", "gain-i", "gain-d", "disturbance"].forEach((id) => byId(id).addEventListener("input", updatePid));
byId("reset-pid").addEventListener("click", () => {
  byId("gain-p").value = 2;
  byId("gain-i").value = 1.2;
  byId("gain-d").value = 0.12;
  byId("disturbance").checked = false;
  updatePid();
});
updateRates();
updatePid();
initProgress();
initQuiz();
initNavigation();
document.body.classList.add("js");
document.querySelectorAll("input:disabled, button:disabled").forEach((element) => { element.disabled = false; });
