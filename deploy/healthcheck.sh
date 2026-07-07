#!/usr/bin/env bash
# Roseair Logistics — Health check against /health endpoint
# Usage: bash deploy/healthcheck.sh [base_url] [timeout_seconds]
# Exit code: 0 = healthy, 1 = unhealthy

set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"
TIMEOUT="${2:-10}"

HEALTH_URL="${BASE_URL}/health"

echo "=== Roseair Health Check ==="
echo "URL:     ${HEALTH_URL}"
echo "Timeout: ${TIMEOUT}s"

# ── 1. HTTP status check ───────────────────────────────────────────────
echo ""
echo "[1/3] HTTP status..."
HTTP_RESPONSE=$(curl -s -o /tmp/roseair-health-response.txt -w "%{http_code}" \
    --max-time "${TIMEOUT}" "${HEALTH_URL}" 2>/dev/null || echo "000")

if [ "${HTTP_RESPONSE}" != "200" ]; then
    echo "FAIL: Expected HTTP 200, got ${HTTP_RESPONSE}"
    rm -f /tmp/roseair-health-response.txt
    exit 1
fi
echo "OK (HTTP ${HTTP_RESPONSE})"

# ── 2. JSON body validation ────────────────────────────────────────────
echo "[2/3] JSON body..."
BODY=$(cat /tmp/roseair-health-response.txt 2>/dev/null || echo "")
rm -f /tmp/roseair-health-response.txt

if [ -z "${BODY}" ]; then
    echo "FAIL: Empty response body"
    exit 1
fi

# Validate JSON and check required fields using node (more reliable than jq)
NODE_CHECK=$(node -e "
const body = JSON.parse(process.argv[1]);
const checks = {
  status: body.status === 'ok',
  hasTimestamp: typeof body.timestamp === 'string' && body.timestamp.length > 0,
  hasUptime: typeof body.uptime === 'number' && body.uptime >= 0,
  buildLoaded: body.buildLoaded === true
};
const allOk = Object.values(checks).every(Boolean);
if (!allOk) {
  console.error(JSON.stringify(checks, null, 2));
  process.exit(1);
}
console.log('OK (status=ok, uptime=' + body.uptime + 's, buildLoaded=true)');
" "${BODY}" 2>&1) || {
    echo "FAIL: Health check validation failed"
    echo "${NODE_CHECK}"
    exit 1
}
echo "${NODE_CHECK}"

# ── 3. PM2 process check ──────────────────────────────────────────────
echo "[3/3] PM2 process..."
if command -v pm2 &>/dev/null; then
    PM2_STATUS=$(pm2 show roseair 2>/dev/null | grep -i "status" | awk '{print $NF}' || echo "unknown")
    if [ "${PM2_STATUS}" = "online" ]; then
        echo "OK (PM2: online)"
    else
        echo "WARN: PM2 status is '${PM2_STATUS}' (expected 'online')"
        # Don't fail — PM2 might be starting; curl already validated the app
    fi
else
    echo "SKIP (PM2 not found on this host)"
fi

echo ""
echo "=== Health check passed ==="
exit 0
