#!/bin/bash
# =============================================================================
# deploy-backend.sh — Dijalankan DI VPS (bukan di mesin lokal), dipanggil oleh
# job "deploy-backend" di .github/workflows/deploy-services.yml via SSH setiap
# kali ada push ke branch main yang mengubah folder backend_chatbot/.
#
# Prasyarat (lihat deployment/setup-vps.sh bagian git clone):
#   - Repo sudah di-clone (sparse-checkout: backend_chatbot/ + deployment/) ke
#     /opt/helpdesk-backend, dimiliki user "chatbot", dengan deploy key terdaftar
#     di GitHub (Settings > Deploy keys, read-only) agar bisa git pull tanpa
#     password.
#   - git-lfs sudah di-install & di-init (model.safetensors disimpan via Git LFS).
#   - User "chatbot" punya izin sudo NOPASSWD khusus untuk:
#       systemctl restart helpdesk-api
#       systemctl status helpdesk-api
#     (lihat instruksi sudoers di setup-vps.sh)
#
# Script ini diasumsikan dijalankan sebagai user "chatbot" via SSH.
# =============================================================================
set -e

REPO_DIR="/opt/helpdesk-backend"
APP_DIR="$REPO_DIR/backend_chatbot"

echo "=== [1/4] git fetch & reset ke origin/main ==="
cd "$REPO_DIR"
git fetch origin main
git reset --hard origin/main
git lfs pull

echo "=== [2/4] Install/update dependencies Python ==="
cd "$APP_DIR"
source venv/bin/activate
pip install -q -r requirements.txt

echo "=== [3/4] Restart service helpdesk-api ==="
sudo systemctl restart helpdesk-api

echo "=== [4/4] Status service ==="
sleep 2
sudo systemctl status helpdesk-api --no-pager -l | grep -E "Active|Main PID"

echo "Deploy backend_chatbot selesai."
