# Panduan Setup & Deployment VPS Baru (Selaras Manual Book — 4.5 Dimodifikasi)

Dokumen ini mengikuti struktur **Bagian 4: Panduan Instalasi** pada *Buku Panduan
Pengoperasian dan Instalasi Website Sistem Chatbot LAA*. Section **4.1–4.4 dan
4.6–4.9 dijalankan sama seperti manual book** (cukup ganti IP VPS & domain baru).
Hanya **4.5 Setup Backend Chatbot** yang diganti: upload kode tidak lagi via
`tar.gz` + `scp`, melainkan **git clone otomatis** lewat
[setup-vps.sh](setup-vps.sh) versi baru, yang juga mengaktifkan **auto-deploy**
via GitHub Actions (lihat [deploy-backend.sh](deploy-backend.sh) dan job
`deploy-backend` di [deploy-services.yml](../.github/workflows/deploy-services.yml)).

Ganti semua `<...>` dengan nilai sebenarnya.

---

## 4.1 Prasyarat

Sama seperti manual book, ditambah:
- [ ] Akses GitHub ke repo `sistemhelpdesk` (untuk daftarkan deploy key)
- [ ] Akun Vercel & domain baru jika ingin sekaligus pindah ke infrastruktur
      khusus TA (lihat diskusi sebelumnya soal transfer/akun baru)

## 4.2 Struktur Direktori Proyek

Sama seperti manual book. Catatan tambahan: setelah 4.5 versi baru, kode backend
berada di `/opt/helpdesk-backend/backend_chatbot/` (hasil git clone dengan
sparse-checkout), bukan langsung di `/opt/helpdesk-backend/`.

## 4.3 Setup VPS Hostinger

**Sama seperti manual book** (4.3.1–4.3.5): beli VPS, akses SSH, install
dependensi, setup PostgreSQL + pgvector, konfigurasi koneksi eksternal, setup
fail2ban. Langkah-langkah ini sudah terotomasi di [setup-vps.sh](setup-vps.sh)
step **[1/11] s/d [4/11]**.

- [ ] **Di komputer lokal (laptop)**, siapkan `deployment/.env.deploy` —
      JANGAN edit nilai langsung di [setup-vps.sh](setup-vps.sh) (file itu
      tertrack git, bisa bocor ke git history kalau ter-commit):
  ```bash
  cd sistemhelpdesk/deployment
  cp .env.deploy.example .env.deploy
  # isi DOMAIN, DB_PASS, REPO_URL dengan nilai asli (ganti SEMUA <...> —
  # tanda <> cuma placeholder, jangan diketik literal). File ini tidak ter-commit.
  ```
- [ ] **Masih di laptop** — upload kedua file lalu SSH masuk ke VPS (jalankan
      dari dalam folder `deployment/`, jangan tulis dobel `deployment/deployment/`):
  ```bash
  scp setup-vps.sh .env.deploy root@<IP_VPS_ASLI>:/root/
  ssh root@<IP_VPS_ASLI>
  ```
- [ ] **Setelah prompt berubah jadi `root@<hostname>:~#`** (artinya sudah
      masuk ke VPS, bukan lagi di laptop) — baru jalankan:
  ```bash
  bash setup-vps.sh   # otomatis baca .env.deploy; berhenti di langkah 4.5 untuk minta input
  ```
- [ ] Setelah setup selesai, hapus dari VPS: `rm /root/.env.deploy`

## 4.4 Migrasi Database dari Sumber ke VPS

**Sama seperti manual book** (4.4.1–4.4.4), dijalankan manual via pgAdmin 4 —
tidak diotomasi oleh script:

- [ ] Ganti password `postgres` di VPS baru
- [ ] Backup database sumber via pgAdmin 4 (format Custom)
- [ ] Koneksi ke VPS baru via SSH Tunnel di pgAdmin 4
- [ ] Restore ke `helpdesk_db` di VPS baru

## 4.5 Setup Backend Chatbot — **DIMODIFIKASI**

### 4.5.1 Install Ollama dan Login
Sama seperti manual book — otomatis di script step **[8/11]**. Pastikan
`ollama login` berhasil sebelum step ini lanjut (kalau script jalan sebelum
login, `ollama pull` akan gagal — jalankan manual lalu re-run bagian itu).

### 4.5.2 Clone Backend via Git *(pengganti "Upload File Backend ke VPS")*
Otomatis di script step **[6/11]**, tapi minta 1 input manual:

- [ ] Script generate SSH keypair khusus user `chatbot` dan menampilkan public key-nya
- [ ] **Tambahkan public key itu sebagai Deploy Key** di GitHub:
      repo → **Settings → Deploy keys → Add deploy key** (read-only)
- [ ] Tekan Enter di terminal VPS untuk lanjut — script otomatis:
  ```bash
  git clone --filter=blob:none --no-checkout <REPO_URL> /opt/helpdesk-backend
  git sparse-checkout init --cone
  git sparse-checkout set backend_chatbot deployment
  git checkout main
  git lfs pull   # ambil model.safetensors (~500MB, tersimpan via Git LFS)
  ```

### 4.5.3 Setup Python Virtualenv dan Install Dependencies
Sama seperti manual book, otomatis di script step **[7/11]** — tapi sumber
`requirements.txt` sekarang dari hasil git clone, bukan file yang di-scp manual.

### 4.5.4 Konfigurasi File .env Produksi
Sama seperti manual book — otomatis di script step **[7/11]**. File `.env`
dibuat langsung di server (tidak pernah masuk git, sesuai `.gitignore`).

### 4.5.5 Buat systemd Service FastAPI
Sama seperti manual book — otomatis di script step **[9/11]**. Satu perbedaan
teknis: `WorkingDirectory` mengarah ke `/opt/helpdesk-backend/backend_chatbot`
(subfolder hasil clone), bukan `/opt/helpdesk-backend` langsung.

### 4.5.6 Setup Auto-Deploy *(langkah baru, tidak ada di manual book)*
Otomatis di script step **[7b/11]** (sudoers) dan **[11/11]** (access key):

- [ ] Script membuat rule sudoers agar user `chatbot` bisa `systemctl restart
      helpdesk-api` tanpa password (dipakai `deploy-backend.sh`)
- [ ] Di **mesin lokal**, generate keypair baru:
  ```bash
  ssh-keygen -t ed25519 -C "github-actions-deploy" -f gh_actions_deploy -N ""
  ```
- [ ] Tempel isi `gh_actions_deploy.pub` ke prompt VPS saat diminta (Ctrl+D untuk akhiri)
- [ ] Simpan `gh_actions_deploy` (private key) — dipakai di langkah GitHub Secrets:

| Secret | Nilai |
|---|---|
| `VPS_HOST` | `<IP_VPS_BARU>` |
| `VPS_USER` | `chatbot` |
| `VPS_SSH_KEY` | isi file `gh_actions_deploy` (private key) |

Setelah ini, setiap push ke `backend_chatbot/**` di branch `main` otomatis
trigger job `deploy-backend` (git pull + restart service) — tidak perlu
`tar.gz`/`scp` manual lagi.

## 4.6 Setup Domain dan SSL

**Sama seperti manual book** — otomatis di script step **[10/11]**:
- [ ] Tambah A record `api` di DNS domain baru → `<IP_VPS_BARU>`
- [ ] Tunggu propagasi: `nslookup api.<DOMAIN_BARU>.com`
- [ ] Script otomatis konfigurasi Nginx + jalankan `certbot --nginx -d <DOMAIN>`

## 4.7 Konfigurasi Firewall VPS

**Sama seperti manual book** — otomatis di script step **[10/11]** (`ufw allow`
22/80/443/5432, `ufw enable`).

## 4.8 Deploy Frontend ke Vercel

**Sama seperti manual book** (4.8.1 & 4.8.2) — dilakukan manual, tidak diotomasi
oleh `setup-vps.sh` (script ini cuma untuk VPS backend):
- [ ] `vercel login` → `vercel --prod` untuk `helpdesk-laa-frontend`
- [ ] Ulangi untuk `admin-page`
- [ ] Set Environment Variables di dashboard Vercel (`NEXT_PUBLIC_API_URL` →
      `https://api.<DOMAIN_BARU>.com`, dst.)

## 4.9 Verifikasi Instalasi

Sama seperti manual book, ditambah verifikasi auto-deploy:
- [ ] Login mahasiswa/dosen, test chatbot, test buat tiket, test dashboard admin
- [ ] **Tambahan:** push perubahan kecil ke `backend_chatbot/**` → cek tab
      **Actions** GitHub job `deploy-backend` sukses, lalu
      `journalctl -u helpdesk-api -n 20 --no-pager` di VPS untuk konfirmasi
      service restart dengan kode terbaru

## 4.10 Troubleshooting Instalasi

Sama seperti manual book, ditambah kasus baru terkait git/auto-deploy:

| Masalah | Penyebab Umum | Solusi |
|---|---|---|
| `git clone` gagal "Permission denied (publickey)" | Deploy key belum ditambahkan/salah di GitHub | Cek `Settings → Deploy keys`, pastikan public key cocok |
| `git lfs pull` error / `model.safetensors` ukurannya kecil (cuma pointer) | `git-lfs` tidak terinstall sebelum clone | `apt install git-lfs && git lfs install`, lalu `git lfs pull` ulang |
| Job `deploy-backend` gagal di Actions: `sudo: a password is required` | Rule sudoers belum/salah terpasang | Cek `/etc/sudoers.d/chatbot-deploy`, jalankan `visudo -c -f /etc/sudoers.d/chatbot-deploy` |
| Job `deploy-backend` gagal: SSH connection refused/timeout | `VPS_HOST`/`VPS_SSH_KEY` salah, atau firewall blokir | Cek Secrets, pastikan `ufw allow 22/tcp` aktif |
| Service `helpdesk-api` gagal start setelah deploy | `pip install -r requirements.txt` gagal karena dependency baru | Cek `journalctl -u helpdesk-api -n 50`, jalankan manual di VPS untuk lihat error lengkap |
