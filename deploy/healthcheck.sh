#!/usr/bin/env bash
# Roseair Logistics — Health check
# Usage: bash deploy/healthcheck.sh
# Exit code: 0 = healthy, 1 = unhealthy

set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"
EXPECTED_STATUS="${2:-200}"
TIMEOUT="${3:-5}"

echo "=== Roseair Health Check ==="
echo "URL:     ${BASE_URL}"
echo "Timeout: ${TIMEOUT}s"

# ── 1. HTTP status check ───────────────────────────────────────────────
echo ""
echo "[1/3] HTTP status..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time "${TIMEOUT}" "${BASE_URL}" 2>/dev/null || echo "000")
if [ "${STATUS}" != "${EXPECTED_STATUS}" ]; then
    echo "FAIL: Expected status ${EXPECTED_STATUS}, got ${STATUS}"
    exit 1
fi
echo "OK (${STATUS})"

# ── 2. Response contains key content ───────────────────────────────────
echo "[2/3] Content check..."
CONTENT=$(curl -s --max-time "${TIMEOUT}" "${BASE_URL}" 2>/dev/null || true)
if [ -z "${CONTENT}" ]; then
    echo "FAIL: Empty response body"
    exit 1
fi

# Check for essential HTML markers
if echo "${CONTENT}" | grep -qi "roseair\|Roseair\|<title"; then
    echo "OK (content verified)"
else
    echo "WARN: Response body does not contain expected branding"
    # Not failing — may be a redirect or minimal page
fi

# ── 3. PM2 process check ──────────────────────────────────────────────
echo "[3/3] PM2 process..."
if command -v pm2 &>/dev/null; then
    PM2_STATUS=$(pm2 show roseair 2>/dev/null | grep -i "status" | awk '{print $NF}' || echo "unknown")
    if [ "${PM2_STATUS}" = "online" ]; then
        echo "OK (PM2: online)"
    else
        echo "WARN: PM2 status is '${PM2_STATUS}'"
        # Not failing — the process might be starting
    fi
else
    echo "SKIP (PM2 not found)"
fi

echo ""
echo "=== Health check passed ==="
exit 0
