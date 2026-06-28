#!/bin/bash
# =============================================================================
# setup-vps.sh — Script setup VPS Hostinger Malaysia untuk backend_chatbot
# OS Target: Ubuntu 22.04 LTS
# Jalankan sebagai root: bash setup-vps.sh
#
# PENTING — JANGAN edit nilai DOMAIN/DB_PASS/REPO_URL di bawah ini langsung
# di file ini. File ini tertrack git; kalau diisi nilai asli lalu di-commit,
# secret akan tersimpan permanen di git history.
#
# Cara aman mengisi nilai asli, pilih salah satu:
#   1) Override via environment variable saat run, contoh:
#        DOMAIN=api.contoh.com DB_PASS='passwordKuat123!' bash setup-vps.sh
#   2) Buat file deployment/.env.deploy (sudah di-gitignore via pola .env*),
#      isi seperti contoh di deployment/.env.deploy.example, lalu jalankan
#      seperti biasa — script otomatis source file itu kalau ada.
# =============================================================================
set -e

cd "$(dirname "$0")"
if [ -f ".env.deploy" ]; then
  echo "Memuat variabel dari deployment/.env.deploy (tidak tertrack git)"
  set -a
  source ".env.deploy"
  set +a
fi

DOMAIN="${DOMAIN:-api.DOMAIN-ANDA.com}"   # <-- override via env var atau .env.deploy
DB_NAME="${DB_NAME:-helpdesk_db}"
DB_PASS="${DB_PASS:-GANTI_PASSWORD_KUAT}"  # <-- override via env var atau .env.deploy (min 20 karakter)
REPO_URL="${REPO_URL:-git@github.com:cuttlefeesh/sistemhelpdesk.git}"  # <-- override jika perlu
REPO_DIR="/opt/helpdesk-backend"   # hasil git clone (root repo)
DEPLOY_DIR="$REPO_DIR/backend_chatbot"  # lokasi kode aplikasi (subfolder repo)

echo "================================================================="
echo " Helpdesk LAA — VPS Setup Script"
echo " Domain  : $DOMAIN"
echo " DB      : $DB_NAME"
echo " Deploy  : $DEPLOY_DIR"
echo "================================================================="
echo ""

# =============================================================================
echo "=== [1/11] Update sistem & install dependensi ==="
# =============================================================================
apt update && apt upgrade -y
apt install -y git git-lfs curl wget nginx \
  python3.12 python3.12-venv python3-pip build-essential \
  postgresql postgresql-contrib \
  postgresql-16-pgvector \
  fail2ban

# Certbot via snap (rekomendasi resmi Ubuntu 24.04)
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot
apt install -y python3-certbot-nginx

# =============================================================================
echo "=== [2/11] Verifikasi pgvector (sudah diinstall via apt) ==="
# =============================================================================
# Di Ubuntu 24.04, postgresql-16-pgvector diinstall via apt pada step sebelumnya
# Verifikasi extension tersedia:
sudo -u postgres psql -c "SELECT * FROM pg_available_extensions WHERE name='vector';" | grep vector
echo "pgvector tersedia via apt (postgresql-16-pgvector)"

# =============================================================================
echo "=== [3/11] Setup PostgreSQL + database ==="
# =============================================================================
# PostgreSQL tidak punya syntax "CREATE DATABASE IF NOT EXISTS" (itu MySQL),
# jadi cek dulu via pg_database pakai \gexec agar idempotent (aman di-run ulang).
sudo -u postgres psql << SQL
SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
\c $DB_NAME
CREATE EXTENSION IF NOT EXISTS vector;
ALTER USER postgres WITH PASSWORD '$DB_PASS';
SQL

# Konfigurasi PostgreSQL untuk koneksi SSL dari Vercel
# Ubuntu 24.04: PostgreSQL 16
PGCONF="/etc/postgresql/16/main/postgresql.conf"
PGHBA="/etc/postgresql/16/main/pg_hba.conf"

sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PGCONF"
sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" "$PGCONF"

# Backup pg_hba.conf asli
cp "$PGHBA" "${PGHBA}.bak"

# Set pg_hba.conf: SSL wajib + scram-sha-256
cat > "$PGHBA" << 'PGHBA_EOF'
# PostgreSQL Client Authentication Configuration
# TYPE  DATABASE  USER      ADDRESS       METHOD
local   all       postgres                peer
local   all       all                     md5
hostssl all       all       0.0.0.0/0     scram-sha-256
PGHBA_EOF

systemctl restart postgresql
echo "PostgreSQL SSL: $(sudo -u postgres psql -c 'SHOW ssl;' -t | tr -d ' ')"

# =============================================================================
echo "=== [4/11] Setup fail2ban untuk proteksi brute force ==="
# =============================================================================
cat > /etc/fail2ban/filter.d/postgresql.conf << 'EOF'
[Definition]
failregex = ^.*FATAL:  password authentication failed for user.*$
            ^.*FATAL:  no pg_hba.conf entry for host.*$
ignoreregex =
journalmatch = _SYSTEMD_UNIT=postgresql.service
EOF

cat > /etc/fail2ban/jail.d/postgresql.conf << 'EOF'
[postgresql]
enabled  = true
filter   = postgresql
logpath  = /var/log/postgresql/postgresql-*.log
maxretry = 5
bantime  = 3600
findtime = 600
EOF

systemctl restart fail2ban
echo "fail2ban aktif: $(fail2ban-client status postgresql 2>/dev/null | grep 'Currently banned' || echo 'OK')"

# =============================================================================
echo "=== [5/11] Buat user chatbot & direktori deploy ==="
# =============================================================================
if ! id "chatbot" &>/dev/null; then
  adduser --disabled-password --gecos "" chatbot
fi
mkdir -p "$REPO_DIR"
chown chatbot:chatbot "$REPO_DIR"

# =============================================================================
echo "=== [6/11] Clone repo via git (deploy key, read-only) ==="
# =============================================================================
# Generate SSH key khusus user "chatbot" untuk akses clone/pull dari GitHub.
# Key ini HANYA dipakai VPS -> GitHub (read-only), berbeda dari key yang dipakai
# GitHub Actions untuk SSH masuk ke VPS (lihat langkah di bawah).
sudo -u chatbot mkdir -p /home/chatbot/.ssh
if [ ! -f /home/chatbot/.ssh/id_ed25519 ]; then
  sudo -u chatbot ssh-keygen -t ed25519 -C "vps-deploy-key" -f /home/chatbot/.ssh/id_ed25519 -N ""
fi
ssh-keyscan -t ed25519 github.com >> /home/chatbot/.ssh/known_hosts 2>/dev/null
chown -R chatbot:chatbot /home/chatbot/.ssh

# Idempotent: kalau repo sudah pernah di-clone (misal script di-run ulang
# setelah gagal di step lain), skip clone & cukup pull update terbaru —
# "git clone" akan error "destination path already exists" kalau dipaksa ulang.
if [ -d "$REPO_DIR/.git" ]; then
  echo "Repo sudah ada di $REPO_DIR, skip clone — jalankan git pull saja."
  cd "$REPO_DIR"
  sudo -u chatbot git fetch origin main
  sudo -u chatbot git reset --hard origin/main
  sudo -u chatbot git lfs pull
else
  echo ""
  echo ">>> Tambahkan PUBLIC KEY berikut sebagai Deploy Key (read-only) di:"
  echo "    GitHub repo > Settings > Deploy keys > Add deploy key"
  echo "-----------------------------------------------------------------"
  cat /home/chatbot/.ssh/id_ed25519.pub
  echo "-----------------------------------------------------------------"
  read -rp "Tekan Enter setelah deploy key ditambahkan di GitHub..."

  # Clone hanya backend_chatbot/ + deployment/ (sparse-checkout) agar tidak
  # menarik source code frontend/admin yang tidak dipakai di VPS ini.
  sudo -u chatbot git clone --filter=blob:none --no-checkout "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
  sudo -u chatbot git sparse-checkout init --cone
  sudo -u chatbot git sparse-checkout set backend_chatbot deployment
  sudo -u chatbot git checkout main
  sudo -u chatbot git lfs pull
fi

# =============================================================================
echo "=== [7/11] Setup Python virtualenv & install dependensi ==="
# =============================================================================
cd "$DEPLOY_DIR"
sudo -u chatbot python3.12 -m venv venv
sudo -u chatbot bash -c "source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt"

# Buat file .env produksi (TIDAK ikut di-track git — lihat backend_chatbot/.gitignore)
cat > "$DEPLOY_DIR/.env" << ENV_EOF
DB_HOST=127.0.0.1
DB_NAME=$DB_NAME
DB_USER=postgres
DB_PASS=$DB_PASS
DB_PORT=5432
CORS_ORIGINS=https://GANTI-FRONTEND.vercel.app,https://GANTI-ADMIN.vercel.app
FRONTEND_URL=https://GANTI-FRONTEND.vercel.app
ENV_EOF
chown chatbot:chatbot "$DEPLOY_DIR/.env"
chmod 600 "$DEPLOY_DIR/.env"
echo ".env dibuat di $DEPLOY_DIR/.env — update CORS_ORIGINS setelah deploy Vercel"

# =============================================================================
echo "=== [7b/11] Sudoers untuk auto-deploy via GitHub Actions ==="
# =============================================================================
# Mengizinkan user "chatbot" merestart/melihat status service ini TANPA password,
# dipakai oleh deployment/deploy-backend.sh saat dipanggil dari GitHub Actions.
# Pakai wildcard "*" di akhir — sudoers mencocokkan command line PERSIS,
# tanpa "*" maka "systemctl status helpdesk-api --no-pager -l" (dengan flag
# tambahan) tidak akan cocok dan sudo tetap minta password.
cat > /etc/sudoers.d/chatbot-deploy << 'EOF'
chatbot ALL=(root) NOPASSWD: /usr/bin/systemctl restart helpdesk-api*, /usr/bin/systemctl status helpdesk-api*
EOF
chmod 440 /etc/sudoers.d/chatbot-deploy
visudo -c -f /etc/sudoers.d/chatbot-deploy

# =============================================================================
echo "=== [8/11] Install Ollama ==="
# =============================================================================
if ! command -v ollama &>/dev/null; then
  curl -fsSL https://ollama.com/install.sh | sh
fi

# Pastikan service ollama ada
if ! systemctl is-enabled ollama &>/dev/null 2>&1; then
  cat > /etc/systemd/system/ollama.service << 'EOF'
[Unit]
Description=Ollama Service
After=network.target

[Service]
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="HOME=/root"

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload
  systemctl enable ollama
  systemctl start ollama
fi

echo ">>> Pull model Ollama (bisa memakan waktu lama)..."
ollama pull nomic-embed-text
ollama pull gemma3:27b-cloud
echo "Model Ollama:"
ollama list

# Verifikasi instalasi Ollama benar-benar bisa generate embedding. Instalasi
# via install.sh kadang korup/tidak lengkap (binary "llama-server" hilang),
# baru kelihatan saat chatbot dipakai kalau tidak dicek di sini.
echo ">>> Verifikasi embedding Ollama..."
EMBED_TEST=$(curl -s http://127.0.0.1:11434/api/embeddings -d '{"model":"nomic-embed-text","prompt":"test"}')
if echo "$EMBED_TEST" | grep -q '"embedding"'; then
  echo "Ollama embedding OK."
else
  echo "Ollama embedding GAGAL ($EMBED_TEST) — mencoba reinstall Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
  systemctl restart ollama
  sleep 3
  ollama pull nomic-embed-text
  EMBED_TEST=$(curl -s http://127.0.0.1:11434/api/embeddings -d '{"model":"nomic-embed-text","prompt":"test"}')
  if echo "$EMBED_TEST" | grep -q '"embedding"'; then
    echo "Ollama embedding OK setelah reinstall."
  else
    echo "Ollama embedding MASIH GAGAL — cek manual: journalctl -u ollama -n 50 --no-pager"
  fi
fi

# =============================================================================
echo "=== [9/11] Setup systemd service FastAPI ==="
# =============================================================================
cat > /etc/systemd/system/helpdesk-api.service << EOF
[Unit]
Description=Helpdesk Chatbot FastAPI
After=network.target ollama.service postgresql.service

[Service]
Type=simple
User=chatbot
WorkingDirectory=$DEPLOY_DIR
Environment="PATH=$DEPLOY_DIR/venv/bin"
ExecStart=$DEPLOY_DIR/venv/bin/uvicorn api_chatbot:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable helpdesk-api
systemctl start helpdesk-api

# =============================================================================
echo "=== [10/11] Konfigurasi Nginx + Firewall + SSL ==="
# =============================================================================
cat > /etc/nginx/sites-available/helpdesk-api << NGINX_EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;
    }

    location /ollama/ {
        rewrite ^/ollama/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:11434;
        proxy_read_timeout 60s;
        limit_except POST OPTIONS { deny all; }
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/helpdesk-api /etc/nginx/sites-enabled/helpdesk-api
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5432/tcp
ufw --force enable

# SSL
echo ">>> Setup SSL untuk $DOMAIN (DNS A record harus sudah propagasi)"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
  -m "admin@$(echo $DOMAIN | cut -d'.' -f2-)" || \
  echo "SSL gagal — pastikan DNS sudah propagasi lalu jalankan: certbot --nginx -d $DOMAIN"

# HSTS — baru bisa ditambahkan SETELAH certbot membuat blok "listen 443 ssl"
# (tidak bisa ditulis di heredoc atas karena saat itu cert/blok SSL belum ada).
# Vercel (frontend/admin) sudah otomatis kirim header ini sendiri; backend di
# VPS ini perlu di-set manual karena tidak lewat Vercel.
if grep -q "listen 443 ssl" /etc/nginx/sites-available/helpdesk-api 2>/dev/null && \
   ! grep -q "Strict-Transport-Security" /etc/nginx/sites-available/helpdesk-api; then
  sed -i '/listen 443 ssl;/a\    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;' \
    /etc/nginx/sites-available/helpdesk-api
  echo "HSTS header ditambahkan ke konfigurasi Nginx."
fi

nginx -t && systemctl reload nginx

# =============================================================================
echo "=== [11/11] (OPSIONAL) SSH key admin untuk user chatbot ==="
# =============================================================================
# CATATAN: auto-deploy backend SEKARANG pakai self-hosted GitHub Actions
# runner yang jalan langsung di VPS (lihat BUKU-PANDUAN-INSTALASI.md bagian
# 4.9) — BUKAN lewat SSH dari GitHub Actions. SSH inbound dari IP datacenter
# Azure (tempat GitHub-hosted runner jalan) terbukti di-timeout oleh jaringan
# Hostinger, jadi pendekatan access-key di bawah ini TIDAK dipakai untuk
# auto-deploy. Key ini opsional, cuma untuk akses SSH manual ke user chatbot
# (misal debugging) dari mesin lokal Anda.
read -rp "Mau setup SSH key admin opsional untuk user chatbot sekarang? (y/N) " SETUP_ADMIN_KEY
if [[ "$SETUP_ADMIN_KEY" =~ ^[Yy]$ ]]; then
  mkdir -p /home/chatbot/.ssh
  echo ""
  echo ">>> Generate keypair INI DI MESIN LOKAL (bukan di VPS), contoh:"
  echo "    ssh-keygen -t ed25519 -C \"admin-access\" -f chatbot_admin_key -N \"\""
  echo ""
  echo ">>> Tempel ISI PUBLIC KEY (chatbot_admin_key.pub) di bawah, lalu Enter, lalu Ctrl+D:"
  cat >> /home/chatbot/.ssh/authorized_keys
  chown -R chatbot:chatbot /home/chatbot/.ssh
  chmod 700 /home/chatbot/.ssh
  chmod 600 /home/chatbot/.ssh/authorized_keys
  echo "Simpan private key (chatbot_admin_key) di mesin lokal untuk: ssh -i chatbot_admin_key chatbot@$(curl -s https://api.ipify.org)"
else
  echo "Skip — lihat BUKU-PANDUAN-INSTALASI.md bagian 4.9 untuk setup self-hosted runner (auto-deploy)."
fi

# =============================================================================
echo ""
echo "================================================================="
echo " SETUP SELESAI"
echo "================================================================="
echo " IP VPS   : $(curl -s https://api.ipify.org)"
echo " Domain   : https://$DOMAIN"
echo " Database : $DB_NAME (password tersimpan di $DEPLOY_DIR/.env)"
echo ""
echo " Status service:"
systemctl status helpdesk-api --no-pager -l | grep -E "Active|Main PID"
systemctl status ollama --no-pager -l | grep -E "Active|Main PID"
systemctl status postgresql --no-pager -l | grep -E "Active|Main PID"
echo ""
echo " LANGKAH SELANJUTNYA:"
echo " 1. Migrasi database via pgAdmin 4 (lihat plan deployment)"
echo " 2. Update CORS_ORIGINS di $DEPLOY_DIR/.env dengan URL Vercel"
echo " 3. Deploy frontend ke Vercel dan set environment variables. PENTING:"
echo "    DATABASE_URL WAJIB pakai ?sslmode=require&uselibpqcompat=true"
echo "    (PostgreSQL pakai cert self-signed — tanpa parameter ini, driver pg"
echo "    Node.js modern akan reject dengan error 'self-signed certificate')"
echo " 4. Setup self-hosted GitHub Actions runner di VPS ini (user chatbot) agar"
echo "    push ke backend_chatbot/** otomatis deploy — lihat BUKU-PANDUAN-INSTALASI.md 4.9"
echo " 5. ollama login bisa expired/hilang kalau Ollama di-reinstall manual —"
echo "    kalau chatbot tiba-tiba 401 dari LLM, jalankan 'ollama login' ulang"
echo "================================================================="
