#!/usr/bin/env bash
# Roseair Logistics — Deploy new version
# Usage: sudo bash deploy/deploy.sh [--branch main]
# Idempotent: safe to re-run.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/roseair}"
BRANCH="${1:-main}"
RELEASE_DIR="${APP_DIR}/releases/$(date +%Y%m%d%H%M%S)"
SHARED_DIR="${APP_DIR}/shared"
CURRENT_LINK="${APP_DIR}/current"
KEEP_RELEASES=5

echo "=== Roseair Deploy ==="
echo "Branch: ${BRANCH}"
echo "Release: ${RELEASE_DIR}"

# ── 1. Prepare directories ─────────────────────────────────────────────
echo "[1/6] Preparing directories..."
mkdir -p "${APP_DIR}/releases" "${SHARED_DIR}"

# ── 2. Clone branch ────────────────────────────────────────────────────
echo "[2/6] Cloning ${BRANCH}..."
git clone --depth=1 --branch "${BRANCH}" \
    "git@github.com:anomalyco/roseair-logistics.git" "${RELEASE_DIR}"

# ── 3. Install dependencies ────────────────────────────────────────────
echo "[3/6] Installing dependencies..."
cd "${RELEASE_DIR}"
npm ci --omit=dev

# ── 4. Build ───────────────────────────────────────────────────────────
echo "[4/6] Building..."
npm run build

# ── 5. Link shared files ───────────────────────────────────────────────
echo "[5/6] Linking shared files..."
ln -sf "${SHARED_DIR}/.env.production" "${RELEASE_DIR}/.env.production"
ln -sf "${SHARED_DIR}/logs" "${RELEASE_DIR}/logs"
ln -sf "${SHARED_DIR}/pids" "${RELEASE_DIR}/pids"

# ── 6. Activate release ────────────────────────────────────────────────
echo "[6/6] Activating release..."
ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"

# ── Restart application ────────────────────────────────────────────────
cd "${CURRENT_LINK}"
pm2 delete roseair 2>/dev/null || true
pm2 start ecosystem.config.js

# ── Clean old releases ──────────────────────────────────────────────────
echo "Cleaning old releases..."
ls -1t "${APP_DIR}/releases/" | tail -n +$((KEEP_RELEASES + 1)) | \
    xargs -I {} rm -rf "${APP_DIR}/releases/{}" 2>/dev/null || true

echo ""
echo "=== Deploy complete ==="
echo "Release: ${RELEASE_DIR}"
echo "Active:  ${CURRENT_LINK} → $(readlink -f ${CURRENT_LINK})"
echo ""
