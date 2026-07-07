#!/usr/bin/env bash
# Roseair Logistics — Rollback to previous release
# Usage: sudo bash deploy/rollback.sh [release_dir_name]
#   If no argument is given, rolls back to the second-latest release.
# Idempotent: safe to re-run (will keep pointing at the same release).

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/roseair}"
CURRENT_LINK="${APP_DIR}/current"

echo "=== Roseair Rollback ==="

# ── Determine target release ───────────────────────────────────────────
if [ -n "${1:-}" ]; then
    TARGET="${APP_DIR}/releases/$1"
    if [ ! -d "${TARGET}" ]; then
        echo "ERROR: Release '${APP_DIR}/releases/$1' not found."
        ls "${APP_DIR}/releases/" 2>/dev/null || echo "(no releases exist)"
        exit 1
    fi
else
    TARGET=$(ls -1t "${APP_DIR}/releases/" | sed -n '2p')
    TARGET="${APP_DIR}/releases/${TARGET}"
    if [ ! -d "${TARGET}" ]; then
        echo "ERROR: No previous release found for rollback."
        exit 1
    fi
fi

# ── Confirm ────────────────────────────────────────────────────────────
CURRENT=$(readlink -f "${CURRENT_LINK}" 2>/dev/null || echo "none")
echo "Current: ${CURRENT}"
echo "Target:  ${TARGET}"
echo ""
read -rp "Rollback to target? [y/N] " CONFIRM
if [ "${CONFIRM}" != "y" ] && [ "${CONFIRM}" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

# ── Activate ────────────────────────────────────────────────────────────
echo "Activating ${TARGET}..."
ln -sfn "${TARGET}" "${CURRENT_LINK}"

# ── Restart ─────────────────────────────────────────────────────────────
cd "${CURRENT_LINK}"
pm2 delete roseair 2>/dev/null || true
pm2 start ecosystem.config.js

echo ""
echo "=== Rollback complete ==="
echo "Active: ${CURRENT_LINK} → $(readlink -f ${CURRENT_LINK})"
echo ""
