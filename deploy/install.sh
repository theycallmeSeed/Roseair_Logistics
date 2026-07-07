#!/usr/bin/env bash
# Roseair Logistics — First-time server installation
# Usage: sudo bash deploy/install.sh
# Idempotent: safe to re-run.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/roseair}"
APP_USER="${APP_USER:-roseair}"
NODE_VERSION="${NODE_VERSION:-20}"
DOMAIN="${DOMAIN:-roseairlogistics.com}"

echo "=== Roseair Installer ==="

# ── 1. System dependencies ──────────────────────────────────────────────
echo "[1/8] System dependencies..."
apt-get update -qq
apt-get install -y -qq \
    curl \
    gnupg \
    build-essential \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw

# ── 2. Node.js via NodeSource ───────────────────────────────────────────
echo "[2/8] Node.js ${NODE_VERSION}..."
if ! command -v node &>/dev/null; then
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
    apt-get install -y -qq nodejs
fi
echo "node $(node -v), npm $(npm -v)"

# ── 3. PM2 globally ────────────────────────────────────────────────────
echo "[3/8] PM2..."
if ! command -v pm2 &>/dev/null; then
    npm install -g pm2
fi

# ── 4. Application user ─────────────────────────────────────────────────
echo "[4/8] Application user..."
id -u "${APP_USER}" &>/dev/null || useradd -m -s /bin/bash "${APP_USER}"

# ── 5. Application directory ────────────────────────────────────────────
echo "[5/8] Application directory..."
mkdir -p "${APP_DIR}"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}"

# ── 6. Firewall ─────────────────────────────────────────────────────────
echo "[6/8] Firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# ── 7. Nginx configuration ─────────────────────────────────────────────
echo "[7/8] Nginx..."
if [ -f "nginx/roseair.conf" ]; then
    cp nginx/roseair.conf "/etc/nginx/sites-available/${DOMAIN}"
    ln -sf "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl enable nginx
    systemctl restart nginx
fi

# ── 8. Log directories ──────────────────────────────────────────────────
echo "[8/8] Log directories..."
mkdir -p "${APP_DIR}/logs" "${APP_DIR}/pids"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/logs" "${APP_DIR}/pids"

echo ""
echo "=== Install complete ==="
echo ""
echo "Next steps:"
echo "  1. Clone repository: git clone git@github.com:theycallmeSeed/Roseair_Logistics.git ${APP_DIR}/current"
echo "  2. Create ${APP_DIR}/shared directory and copy .env.production"
echo "  3. Run: cd ${APP_DIR}/current && npm ci --omit=dev"
echo "  4. Run: cd ${APP_DIR}/current && npm run build"
echo "  5. Run: cd ${APP_DIR}/current && sudo nginx -t && sudo systemctl reload nginx"
echo "  6. Run: cd ${APP_DIR}/current && pm2 start ecosystem.config.js"
echo "  7. Run: pm2 save && sudo env PATH=\$PATH:/usr/bin pm2 startup systemd"
echo "  8. Obtain SSL: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
