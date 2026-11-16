# SkyFluxFPV Learning Series - PID & Rates Flight School

Materi belajar berbahasa Indonesia: enam episode bergaya anime, ilustrasi SVG original, lab Actual Rates, model PID edukasi, kuis dengan penjelasan, dan sumber primer.

**Website:** https://edhotp.github.io/skyfluxfpv-pid-rates/

## Isi dan batas penggunaan

- Sekitar 48 menit belajar untuk pilot pemula sampai menengah; fokus Acro / Rate mode.
- Karakter original Aira dan Kiro. Visual statis, bukan video atau audio.
- Lab Rate menggunakan hubungan matematis Actual Rates yang diverifikasi terhadap Betaflight 2026.6.2, commit `e0b7bb01b17b21351057e9ead2d1ab39dd44fa16`.
- Center <= Max dibatasi oleh rentang UI. Lab tidak mencakup deadband, RC smoothing, rate limit tambahan, maupun dinamika pesawat.
- Lab PID adalah model pengajaran independen berskala tanpa dimensi: satu sumbu, lag aktuator, drag, integral terbatas, D pada laju terukur, dan gangguan tetap opsional. Bukan implementasi atau prediksi performa Betaflight; tidak ada FF, sensor noise, resonansi, mixer, atau model termal.
- Tidak ada rekomendasi gain universal, ekspor CLI, koneksi flight controller, atau autotune.
- Progres membaca disimpan di localStorage browser. Kegagalan penyimpanan diberitahukan; tidak ada akun atau pelacak.
- Semua font dan aset di-host sendiri. Tidak membutuhkan backend, paket npm, API key, CDN, atau proses build.

## Sumber terverifikasi

Diperiksa pada 16 November 2026:

1. [Rate Calculator resmi](https://betaflight.com/docs/wiki/guides/current/Rate-Calculator).
2. [Implementasi Actual Rates 2026.6.2](https://github.com/betaflight/betaflight/blob/e0b7bb01b17b21351057e9ead2d1ab39dd44fa16/src/main/fc/rc.c).
3. [Implementasi PID 2026.6.2](https://github.com/betaflight/betaflight/blob/e0b7bb01b17b21351057e9ead2d1ab39dd44fa16/src/main/flight/pid.c).
4. [Keselamatan resmi](https://betaflight.com/docs/wiki/guides/current/Safety).
5. [2026.6 Release Notes](https://betaflight.com/docs/wiki/release/Betaflight-2026-6-Release-Notes).
6. [Rilis 2026.6.2](https://github.com/betaflight/betaflight/releases/tag/2026.6.2).
7. [4.3 Tuning Notes](https://betaflight.com/docs/wiki/tuning/4-3-Tuning-Notes), hanya konteks historis untuk backup, preset, dan kewaspadaan lintas versi. Angka dan menu 4.3 bukan resep firmware baru.

Penjelasan dan kode situs ditulis secara independen; kode firmware tidak disalin ke situs. Nama parameter, default, dan UI dapat berubah. Gunakan dokumentasi yang sesuai dengan versi firmware dan hardware aktual.

## Menampilkan dan memublikasikan

Situs adalah HTML/CSS/JavaScript statis tanpa build. Untuk pratinjau lokal, jalankan server HTTP statis pada folder ini (misalnya `python3 -m http.server 8000`) lalu buka `http://localhost:8000`. Modul JavaScript perlu HTTP, bukan membuka berkas HTML langsung dengan skema `file:`.

GitHub Pages: **Settings > Pages > Deploy from a branch > main > /(root)**. Semua path aset bersifat relatif sehingga dapat digunakan pada URL subfolder repository. Berkas `.nojekyll` mempertahankan publikasi statis langsung.

## Aset dan atribusi

- `assets/hangar.svg` dan `assets/mark.svg`: ilustrasi vektor original untuk materi ini, bukan karakter franchise anime.
- Chakra Petch Bold: [Google Fonts](https://github.com/google/fonts/tree/main/ofl/chakrapetch), SIL Open Font License 1.1; lihat [lisensi](./assets/fonts/chakra-OFL.txt).
- Manrope variable: [Google Fonts](https://github.com/google/fonts/tree/main/ofl/manrope), SIL Open Font License 1.1; lihat [lisensi](./assets/fonts/manrope-OFL.txt).

Tidak ada klaim afiliasi atau dukungan dari Betaflight. Nama Betaflight adalah milik pemegang haknya masing-masing.

**Keselamatan:** lepas propeller saat setup. Situs ini tidak menilai kelayakan terbang, tidak memprediksi suhu motor, dan tidak menggantikan bantuan pilot berpengalaman.
