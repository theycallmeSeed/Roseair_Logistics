# Roseair Logistics — Deployment Guide

Target: Ubuntu 24.04, Node 20, PM2, Nginx, Certbot

## Prerequisites

- Ubuntu 24.04 server with SSH access and sudo
- Domain `roseairlogistics.com` (or your domain) pointing to the server IP
- Resend API key (`https://resend.com/api-keys`)
- Resend-verified sender domain for `FROM_EMAIL`
- GitHub SSH deploy key with read-only access to the repository

## Directory Layout

```
/opt/roseair/
├── current → /opt/roseair/releases/20260707120000   # symlink to active release
├── releases/
│   ├── 20260707120000/                               # full deploy (node_modules, build)
│   ├── 20260706120000/
│   └── 20260705120000/
├── shared/
│   ├── .env.production                               # secrets (persists across deploys)
│   ├── logs/                                         # PM2 log files
│   └── pids/                                         # PM2 PID files
└── deploy/                                           # scripts from the repo
```

## First Deployment

```bash
# 1. SSH into the server
ssh root@roseairlogistics.com

# 2. Clone the repository
git clone git@github.com:anomalyco/roseair-logistics.git /opt/roseair/current
cd /opt/roseair/current

# 3. Run the installer (system deps, Node, PM2, Nginx, UFW)
sudo bash deploy/install.sh

# 4. Create production env file
cp .env.production.example /opt/roseair/shared/.env.production
nano /opt/roseair/shared/.env.production
# Fill in: RESEND_API_KEY, CONTACT_EMAIL, FROM_EMAIL

# 5. Link env and log directories
ln -sf /opt/roseair/shared/.env.production /opt/roseair/current/.env.production
ln -sf /opt/roseair/shared/logs /opt/roseair/current/logs
ln -sf /opt/roseair/shared/pids /opt/roseair/current/pids

# 6. Install and build
cd /opt/roseair/current
npm ci --omit=dev
npm run build

# 7. Test the server
npm run start &
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
# Expected: 200
kill %1

# 8. Start with PM2
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd

# 9. Obtain SSL certificate
sudo certbot --nginx -d roseairlogistics.com -d www.roseairlogistics.com

# 10. Verify
curl -I https://roseairlogistics.com
# Expected: HTTP/2 200, Strict-Transport-Security header
```

## Deploying Updates

```bash
# Automated (from repo root on the server):
sudo bash deploy/deploy.sh main

# Or manually:
#   1. Push to GitHub
#   2. SSH into server
#   3. cd /opt/roseair/current && git pull
#   4. npm ci --omit=dev
#   5. npm run build
#   6. pm2 restart roseair (graceful)
```

The `deploy.sh` script:

1. Clones the specified branch into a timestamped release directory
2. Runs `npm ci --omit=dev`
3. Runs `npm run build`
4. Links `.env.production`, `logs/`, and `pids/` from shared storage
5. Updates the `current` symlink
6. Restarts PM2
7. Cleans old releases (keeps last 5)

## Rollback

```bash
# Roll back to the previous release:
sudo bash deploy/rollback.sh

# Roll back to a specific release:
ls /opt/roseair/releases/
sudo bash deploy/rollback.sh 20260706120000
```

The rollback script:

1. Finds the target release
2. Asks for confirmation
3. Updates the `current` symlink
4. Restarts PM2

## SSL Certificate Management

```bash
# Obtain or renew:
sudo certbot --nginx -d roseairlogistics.com -d www.roseairlogistics.com

# Test auto-renewal:
sudo certbot renew --dry-run

# Certbot installs a systemd timer — renewals happen automatically.
```

## PM2 Management

```bash
# Status
pm2 status
pm2 show roseair
pm2 logs roseair
pm2 logs roseair --lines 100

# Restart (graceful — zero-downtime)
pm2 reload roseair

# Stop / Start
pm2 stop roseair
pm2 start roseair

# Save process list
pm2 save

# View metrics
pm2 monit
```

### PM2 Configuration (`ecosystem.config.js`)

| Setting               | Value    | Notes                         |
| --------------------- | -------- | ----------------------------- |
| instances             | 1        | Single process (in-memory)    |
| exec_mode             | fork     | Not cluster (in-memory state) |
| max_memory_restart    | 512M     | Restart if exceeds 512 MB     |
| max_restarts          | 10       | Max crash attempts            |
| restart_delay         | 5000 ms  | Wait between restarts         |
| kill_timeout          | 10000 ms | SIGTERM → SIGKILL grace       |
| listen_timeout        | 10000 ms | Wait for listen after restart |
| shutdown_with_message | true     | Send shutdown message         |

## Logs

```bash
# PM2 logs
tail -f /opt/roseair/shared/logs/roseair-out.log
tail -f /opt/roseair/shared/logs/roseair-error.log

# Nginx logs
tail -f /var/log/nginx/roseair-access.log
tail -f /var/log/nginx/roseair-error.log

# Application logs (server.js)
# Errors are logged to stderr via console.error and captured by PM2.
```

## Health Check

```bash
# Direct (Node server)
bash deploy/healthcheck.sh http://127.0.0.1:3000

# Via Nginx
bash deploy/healthcheck.sh https://roseairlogistics.com

# Manual
curl -f http://127.0.0.1:3000
curl -f https://roseairlogistics.com/health
```

## Troubleshooting

### Server won't start

```bash
# Check build output exists
ls -la dist/server/index.js

# Check Node version
node -v   # should be >= 20

# Check for port conflicts
ss -tlnp | grep 3000

# Check env file
test -f .env.production && echo "exists" || echo "missing"

# Run directly (not PM2) to see errors
node server.js
```

### Forms not sending email

```bash
# Check env vars
node -e "console.log(process.env.RESEND_API_KEY ? 'set' : 'unset')"

# Verify Resend API key in dashboard
# Verify FROM_EMAIL domain is verified in Resend
```

### Nginx issues

```bash
# Test configuration
sudo nginx -t

# Check syntax errors
sudo nginx -t 2>&1

# Restart
sudo systemctl reload nginx

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### SSL issues

```bash
# Check certificate expiry
sudo certbot certificates

# Force renew
sudo certbot renew --force-renewal
```

### 502 Bad Gateway

```bash
# PM2 process crashed
pm2 status
pm2 logs roseair --lines 20

# Nginx cannot reach backend
curl -f http://127.0.0.1:3000

# Port mismatch
grep proxy_pass /etc/nginx/sites-available/roseairlogistics.com
grep PORT /opt/roseair/current/.env.production
```

## Security Notes

- The Node process binds to `127.0.0.1:3000` — it is **not** directly exposed
- Nginx terminates TLS and forwards to the local backend
- UFW allows only SSH (22), HTTP (80), and HTTPS (443)
- HSTS is enabled (6 months, include subdomains)
- Honeypot spam protection on all forms
- Rate limiter: 5 requests/minute/IP on form endpoints

## Deployment Checklist

Before each deployment, verify:

- [ ] `npm run build` succeeds (zero errors)
- [ ] `npm run lint` passes (zero errors, pre-existing warnings acceptable)
- [ ] `npm run start` boots and responds on port 3000
- [ ] `curl -f http://127.0.0.1:3000/` returns 200
- [ ] `curl -f http://127.0.0.1:3000/robots.txt` returns 200
- [ ] `curl -f http://127.0.0.1:3000/sitemap.xml` returns 200
- [ ] `curl -f http://127.0.0.1:3000/favicon.ico` returns 200
- [ ] `.env.production` contains valid `RESEND_API_KEY`, `CONTACT_EMAIL`, `FROM_EMAIL`
- [ ] `FROM_EMAIL` domain is verified in Resend dashboard
- [ ] Nginx config is valid: `sudo nginx -t`
- [ ] PM2 process list is saved: `pm2 save`
- [ ] SSL certificate is valid: `sudo certbot certificates`
