# Migrasi ke VPS Baru + Domain Baru + Akun Vercel/GitHub Khusus TA

Checklist langkah demi langkah untuk pindah dari setup lama (VPS lama, domain pribadi,
Vercel akun pribadi) ke infrastruktur baru yang didedikasikan untuk Tugas Akhir,
sekaligus mengaktifkan auto-deploy backend via git (lihat
[deploy-backend.sh](deploy-backend.sh) dan
[deploy-services.yml](../.github/workflows/deploy-services.yml)).

Ganti semua placeholder `<...>` dengan nilai sebenarnya sebelum dieksekusi.

---

## 0. Prasyarat Akun

- [ ] Akun Hostinger (atau provider VPS lain) **khusus TA** — untuk VPS baru
- [ ] Domain baru **khusus TA**, terdaftar di registrar yang Anda kelola sendiri
- [ ] Akun Vercel **khusus TA** (personal atau Team)
- [ ] Akun/akses GitHub ke repo `sistemhelpdesk` tetap sama (atau pindahkan repo ke
      org/akun GitHub khusus TA jika diinginkan)
- [ ] Akun Ollama (ollama.com) untuk akses model `gemma3:27b-cloud` cloud-hosted

---

## 1. Provision VPS Baru

- [ ] Beli VPS (Hostinger KVM 2 atau setara), region terdekat, OS **Ubuntu 24.04 LTS**
- [ ] Catat IP publik VPS baru: `<IP_VPS_BARU>`
- [ ] Akses awal: `ssh root@<IP_VPS_BARU>`
- [ ] **Set password root yang kuat & unik** (jangan reuse password VPS lama)

## 2. Siapkan Domain Baru

- [ ] Daftarkan/siapkan domain di registrar akun khusus TA, contoh: `helpdesk-laa-ta.com`
- [ ] Belum buat DNS record dulu — IP VPS belum final sampai service jalan (opsional
      buat record sekarang, tinggal update IP-nya nanti)

## 3. Jalankan `setup-vps.sh`

- [ ] Edit variabel di bagian atas [setup-vps.sh](setup-vps.sh) sebelum run:
  ```bash
  DOMAIN="api.<DOMAIN_BARU>.com"
  DB_PASS="<password_kuat_min_20_karakter>"
  REPO_URL="git@github.com:<akun-atau-org>/sistemhelpdesk.git"
  ```
- [ ] Upload & jalankan sebagai root di VPS baru:
  ```bash
  scp deployment/setup-vps.sh root@<IP_VPS_BARU>:/root/
  ssh root@<IP_VPS_BARU>
  bash setup-vps.sh
  ```
- [ ] Saat script **berhenti minta input** (2 kali):
  1. **Deploy key** — copy public key yang ditampilkan, tambahkan di
     GitHub repo → **Settings → Deploy keys → Add deploy key** (read-only, tanpa
     write access), lalu tekan Enter di terminal VPS untuk lanjut.
  2. **Access key GitHub Actions** — di **mesin lokal** generate keypair baru:
     ```bash
     ssh-keygen -t ed25519 -C "github-actions-deploy" -f gh_actions_deploy -N ""
     ```
     Tempel isi `gh_actions_deploy.pub` ke prompt VPS, akhiri dengan Ctrl+D.
     **Simpan** `gh_actions_deploy` (private key) — dibutuhkan di langkah 6.
- [ ] Tunggu script selesai (termasuk `ollama pull gemma3:27b-cloud` & `nomic-embed-text`
      — bisa lama). Pastikan sudah `ollama login` dulu kalau script tidak otomatis minta.
- [ ] Catat output ringkasan di akhir script (IP, domain, status service).

## 4. Migrasi Database

- [ ] Buka pgAdmin 4, **Backup** database sumber (format Custom) → `backup_db.backup`
- [ ] Register server baru di pgAdmin 4: host `127.0.0.1`, SSH Tunnel ke
      `<IP_VPS_BARU>` (user `root`)
- [ ] **Restore** `backup_db.backup` ke `helpdesk_db` di VPS baru (centang
      *Do not save Owner/Privileges*)
- [ ] Verifikasi: `SELECT count(*) FROM users;`, `SELECT count(*) FROM knowledge_base;`
      di VPS baru cocok dengan sumber

## 5. Setup Domain & SSL (kalau belum otomatis dari setup-vps.sh)

- [ ] Tambah/Update **A record** `api` di DNS domain baru → `<IP_VPS_BARU>`
- [ ] Tunggu propagasi: `nslookup api.<DOMAIN_BARU>.com`
- [ ] Jika SSL belum terpasang otomatis oleh script:
  ```bash
  certbot --nginx -d api.<DOMAIN_BARU>.com
  ```
- [ ] Test: `curl https://api.<DOMAIN_BARU>.com` harus dapat respons dari FastAPI

## 6. GitHub Secrets

Di repo → **Settings → Secrets and variables → Actions**, set/update:

| Secret | Nilai |
|---|---|
| `VPS_HOST` | `<IP_VPS_BARU>` |
| `VPS_USER` | `chatbot` |
| `VPS_SSH_KEY` | isi file `gh_actions_deploy` (private key dari langkah 3) |
| `VERCEL_TOKEN` | token baru dari akun Vercel khusus TA |
| `VERCEL_ORG_ID` | dari project Vercel baru (lihat langkah 7) |
| `VERCEL_PROJECT_ID_FRONTEND` | dari project `helpdesk-laa-frontend` baru |
| `VERCEL_PROJECT_ID_ADMIN` | dari project `admin-page` baru |

## 7. Buat Project Vercel Baru (akun khusus TA)

Untuk **frontend** dan **admin** (ulangi 2x):

- [ ] **Add New Project → Import Git Repository** → pilih repo `sistemhelpdesk`
      (pastikan akun GitHub yang terhubung ke akun Vercel ini punya akses repo)
- [ ] Set **Root Directory**: `helpdesk-laa-frontend` (atau `admin-page` untuk project ke-2)
- [ ] Set **Environment Variables**:

  **Frontend (`helpdesk-laa-frontend`):**
  | Variable | Nilai |
  |---|---|
  | `DATABASE_URL` | `postgresql://helpdesk_user:<PASSWORD>@<IP_VPS_BARU>:5432/helpdesk_db?sslmode=require&uselibpqcompat=true` |
  | `NEXT_PUBLIC_BASE_URL` | `https://<nama-project-frontend>.vercel.app` |
  | `NEXT_PUBLIC_API_URL` | `https://api.<DOMAIN_BARU>.com` |
  | `JWT_SECRET` | generate baru: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
  | `EMAIL_USER` / `EMAIL_PASS` | akun Gmail + App Password khusus TA |

  **Admin (`admin-page`):** variabel sejenis (`DATABASE_URL`, `JWT_SECRET`, dll.)

- [ ] **Settings → Git**: nonaktifkan/disconnect auto-deploy bawaan Vercel
      (supaya deploy hanya lewat job `deploy-frontend`/`deploy-admin` di GitHub
      Actions, menghindari deploy dobel — lihat diskusi sebelumnya)
- [ ] Deploy manual pertama kali untuk ambil `VERCEL_PROJECT_ID` & `VERCEL_ORG_ID`
      (terlihat di `.vercel/project.json` setelah `vercel link`, atau di
      Project Settings → General)
- [ ] Isi nilai-nilai ini ke GitHub Secrets (langkah 6)

## 8. Update CORS & Backend Env

- [ ] Update `backend_chatbot/.env` di VPS baru (`/opt/helpdesk-backend/backend_chatbot/.env`):
  ```
  CORS_ORIGINS=https://<nama-project-frontend>.vercel.app,https://<nama-project-admin>.vercel.app
  FRONTEND_URL=https://<nama-project-frontend>.vercel.app
  ```
- [ ] Restart service: `systemctl restart helpdesk-api`

## 9. Test Auto-Deploy

- [ ] Push perubahan kecil (misal komentar) ke `backend_chatbot/**` di branch `main`
- [ ] Cek tab **Actions** di GitHub → job `deploy-backend` harus jalan & sukses
- [ ] `ssh chatbot@<IP_VPS_BARU>` → `journalctl -u helpdesk-api -n 20 --no-pager`
      pastikan service restart dengan kode terbaru
- [ ] Push perubahan kecil ke `helpdesk-laa-frontend/**` → cek job `deploy-frontend`
      sukses & Vercel project ter-update

## 10. Verifikasi End-to-End

- [ ] Login sebagai mahasiswa/dosen di `https://<frontend-baru>.vercel.app`
- [ ] Kirim pertanyaan ke chatbot → pastikan dapat respons (RAG jalan, Ollama terkoneksi)
- [ ] Buat tiket layanan → cek muncul di dashboard admin (`https://<admin-baru>.vercel.app`)
- [ ] Balas tiket dari admin → cek notifikasi muncul di sisi user
- [ ] Test reset password (cek email terkirim dengan link `NEXT_PUBLIC_BASE_URL` yang benar)

## 11. Bersih-bersih

- [ ] Matikan/hapus VPS lama (setelah yakin semua data sudah dimigrasi)
- [ ] Hapus project Vercel lama di akun pribadi
- [ ] **Rotate/ganti password root VPS lama** jika belum, terutama jika pernah
      dibagikan di luar saluran aman
- [ ] Hapus domain lama dari DNS records yang mengarah ke VPS lama (atau transfer
      sesuai prosedur registrar, lihat diskusi sebelumnya)
