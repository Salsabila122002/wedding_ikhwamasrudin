
/* ============================================================
   main.js — Wedding Invitation
   ============================================================ */

// Tanggal acara: 22 November 2026, pukul 08.00 WITA
const WEDDING_DATE = new Date("2026-11-22T08:00:00+08:00");

// ============================================================
// ELEMENT
// ============================================================

const btnOpen = document.getElementById("btnOpen");
const invitation = document.getElementById("invitation");

const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

const wishesForm = document.getElementById("wishesForm");
const wishesList = document.getElementById("wishesList");

let countdownInterval = null;
let isPlaying = false;

// ============================================================
// OPEN INVITATION + AUTO PLAY MUSIC
// ============================================================

btnOpen?.addEventListener("click", async () => {
  if (!invitation) return;

  // Tampilkan isi undangan
  invitation.classList.add("is-open");
  invitation.setAttribute("aria-hidden", "false");

  btnOpen.setAttribute("aria-expanded", "true");
  btnOpen.disabled = true;
  btnOpen.innerHTML = "Undangan Dibuka ♥";

  // Tampilkan tombol musik
  if (musicToggle) {
    musicToggle.hidden = false;
  }

  // Mulai countdown
  startCountdown();

  // Mulai musik saat tombol undangan ditekan
  await playBackgroundMusic();

  // Scroll menuju pembukaan undangan
  setTimeout(() => {
    document.getElementById("opening")?.scrollIntoView({
      behavior: "smooth"
    });
  }, 150);
});

// ============================================================
// MUSIC PLAYER
// ============================================================

async function playBackgroundMusic() {
  if (!bgMusic) return;

  try {
    await bgMusic.play();

    isPlaying = true;
    updateMusicButton();

  } catch (error) {
    isPlaying = false;
    updateMusicButton();

    console.warn(
      "Musik belum dapat diputar. Periksa lokasi file audio.",
      error
    );
  }
}

function pauseBackgroundMusic() {
  if (!bgMusic) return;

  bgMusic.pause();
  isPlaying = false;
  updateMusicButton();
}

function updateMusicButton() {
  if (!musicToggle) return;

  if (isPlaying) {
    musicToggle.textContent = "🔊";
    musicToggle.classList.add("is-playing");
    musicToggle.setAttribute("aria-label", "Matikan musik");
    musicToggle.setAttribute("title", "Matikan musik");
  } else {
    musicToggle.textContent = "🎵";
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-label", "Putar musik");
    musicToggle.setAttribute("title", "Putar musik");
  }
}

// Tombol musik untuk pause dan play
musicToggle?.addEventListener("click", async () => {
  if (!bgMusic) return;

  if (isPlaying) {
    pauseBackgroundMusic();
  } else {
    await playBackgroundMusic();
  }
});

// Sinkronisasi status jika audio berhenti atau selesai
bgMusic?.addEventListener("pause", () => {
  isPlaying = false;
  updateMusicButton();
});

bgMusic?.addEventListener("play", () => {
  isPlaying = true;
  updateMusicButton();
});

// ============================================================
// COUNTDOWN
// ============================================================

function startCountdown() {
  const cdDays = document.getElementById("cdDays");
  const cdHours = document.getElementById("cdHours");
  const cdMinutes = document.getElementById("cdMinutes");
  const cdSeconds = document.getElementById("cdSeconds");

  if (!cdDays || !cdHours || !cdMinutes || !cdSeconds) return;

  function updateCountdown() {
    const difference = WEDDING_DATE.getTime() - Date.now();

    if (difference <= 0) {
      cdDays.textContent = "00";
      cdHours.textContent = "00";
      cdMinutes.textContent = "00";
      cdSeconds.textContent = "00";

      clearInterval(countdownInterval);
      countdownInterval = null;
      return;
    }

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    cdDays.textContent = String(days).padStart(2, "0");
    cdHours.textContent = String(hours).padStart(2, "0");
    cdMinutes.textContent = String(minutes).padStart(2, "0");
    cdSeconds.textContent = String(seconds).padStart(2, "0");
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// ============================================================
// COPY REKENING
// ============================================================

document.querySelectorAll(".gift__copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const accountNumber = button.dataset.copy;

    if (!accountNumber) return;

    const originalText = button.textContent;

    try {
      await navigator.clipboard.writeText(accountNumber);

      button.textContent = "✓ Berhasil disalin";

      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);

    } catch (error) {
      button.textContent = "Gagal menyalin";

      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  });
});

// ============================================================
// GUESTBOOK / WISHES
// ============================================================

let wishes = [];

try {
  wishes = JSON.parse(
    localStorage.getItem("weddingWishes") || "[]"
  );

  if (!Array.isArray(wishes)) {
    wishes = [];
  }
} catch (error) {
  wishes = [];
}

renderWishes();

wishesForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("guestName")?.value.trim();
  const attend = document.getElementById("guestAttend")?.value;
  const message = document.getElementById("guestMessage")?.value.trim();

  if (!name || !attend || !message) {
    alert("Mohon lengkapi semua kolom terlebih dahulu.");
    return;
  }

  const attendLabels = {
    hadir: "✅ Hadir",
    tidak: "❌ Tidak hadir",
    mungkin: "🤔 Mungkin hadir"
  };

  const newWish = {
    id: Date.now(),
    name: name,
    attend: attendLabels[attend] || attend,
    message: message,
    time: new Date().toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short"
    })
  };

  wishes.unshift(newWish);

  try {
    localStorage.setItem(
      "weddingWishes",
      JSON.stringify(wishes)
    );
  } catch (error) {
    console.warn("Ucapan tidak dapat disimpan di browser.");
  }

  renderWishes();
  wishesForm.reset();

  wishesList?.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

// Menampilkan ucapan
function renderWishes() {
  if (!wishesList) return;

  if (wishes.length === 0) {
    wishesList.innerHTML = `
      <div class="wishes__empty">
        <p>Jadilah yang pertama mengirim ucapan 🌸</p>
      </div>
    `;
    return;
  }

  wishesList.innerHTML = wishes.map((wish) => `
    <article class="wish-item">
      <p class="wish-item__name">
        ${escapeHtml(wish.name || "")}
      </p>

      <p class="wish-item__status">
        ${escapeHtml(wish.attend || "")}
        ·
        ${escapeHtml(wish.time || "")}
      </p>

      <p class="wish-item__message">
        ${escapeHtml(wish.message || "")}
      </p>
    </article>
  `).join("");
}

// Mencegah input HTML dijalankan sebagai kode
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
