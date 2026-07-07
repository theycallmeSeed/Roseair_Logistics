# Roseair Logistics — Deployment Guide

Target: Ubuntu 24.04, Node 20, PM2, Nginx, Certbot

Repository: `https://github.com/theycallmeSeed/Roseair_Logistics`

## Prerequisites

- Ubuntu 24.04 server with SSH access and sudo
- Domain pointing to the server IP (default: `roseairlogistics.com`)
- Resend API key (`https://resend.com/api-keys`)
- Resend-verified sender domain for `FROM_EMAIL`
- GitHub SSH deploy key with read-only access to the repository

## Directory Layout

```
/opt/roseair/
├── current → /opt/roseair/releases/20260707120000
├── releases/
│   ├── 20260707120000/
│   ├── 20260706120000/
│   └── 20260705120000/
├── shared/
│   ├── .env.production
│   ├── logs/
│   └── pids/
└── deploy/
```

## First Deployment

```bash
# SSH into the server
ssh root@roseairlogistics.com

# Clone the repository
git clone git@github.com:theycallmeSeed/Roseair_Logistics.git /opt/roseair/current
cd /opt/roseair/current

# Run the installer (system deps, Node, PM2, Nginx, UFW)
sudo bash deploy/install.sh

# Create shared directory and env file
mkdir -p /opt/roseair/shared
cp .env.production.example /opt/roseair/shared/.env.production
nano /opt/roseair/shared/.env.production
# Fill in: RESEND_API_KEY, CONTACT_EMAIL, FROM_EMAIL

# Link env and log directories
ln -sf /opt/roseair/shared/.env.production /opt/roseair/current/.env.production
ln -sfn /opt/roseair/shared/logs /opt/roseair/current/logs
ln -sfn /opt/roseair/shared/pids /opt/roseair/current/pids

# Install and build
cd /opt/roseair/current
npm ci --omit=dev
npm run build

# Test the server
node server.js &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/health
# Expected: 200
kill %1

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd

# Obtain SSL certificate
sudo certbot --nginx -d roseairlogistics.com -d www.roseairlogistics.com

# Verify
curl -I https://roseairlogistics.com/health
# Expected: HTTP/2 200
```

## Deploying Updates

```bash
# Automated deploy (via GitHub Actions):
#   Push to main — the Deploy workflow runs automatically.
#   Or trigger manually: GitHub → Actions → Deploy → Run workflow

# Manual deploy from server:
bash deploy/deploy.sh main
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

1. Validates the target release has `ecosystem.config.js`, `dist/server`, `dist/client`
2. Asks for confirmation (skips when piped from CI)
3. Updates the `current` symlink
4. Restarts PM2

## SSL Certificate Management

```bash
# Obtain or renew:
sudo certbot --nginx -d roseairlogistics.com -d www.roseairlogistics.com

# Test auto-renewal:
sudo certbot renew --dry-run
```

## PM2 Management

```bash
pm2 status
pm2 show roseair
pm2 logs roseair --lines 100
pm2 reload roseair       # graceful restart
pm2 stop roseair
pm2 start roseair
pm2 save
pm2 monit
```

## Logs

```bash
# PM2 logs
tail -f /opt/roseair/shared/logs/roseair-out.log
tail -f /opt/roseair/shared/logs/roseair-error.log

# Nginx logs
tail -f /var/log/nginx/roseair-access.log
tail -f /var/log/nginx/roseair-error.log
```

## Health Check

```bash
# Direct (Node server)
bash deploy/healthcheck.sh http://127.0.0.1:3000

# Via Nginx
bash deploy/healthcheck.sh https://roseairlogistics.com

# Manual
curl -f http://127.0.0.1:3000/health
```

## Troubleshooting

### Server won't start

```bash
ls -la dist/server/index.js
node -v                          # should be >= 20
ss -tlnp | grep 3000             # check port conflicts
test -f .env.production && echo "exists" || echo "missing"
node server.js                   # run directly to see errors
```

### Forms not sending email

```bash
node -e "console.log(process.env.RESEND_API_KEY ? 'set' : 'unset')"
# Verify FROM_EMAIL domain is verified in Resend dashboard
```

### Nginx issues

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/error.log
```

### 502 Bad Gateway

```bash
pm2 status
pm2 logs roseair --lines 20
curl -f http://127.0.0.1:3000/health
grep proxy_pass /etc/nginx/sites-available/roseairlogistics.com
grep PORT /opt/roseair/current/.env.production
```

## Deployment Checklist

Before each deployment, verify:

- [ ] `npm run build` succeeds (zero errors)
- [ ] `npm run lint` passes (zero errors)
- [ ] `npm run start` boots and responds on port 3000
- [ ] `curl -f http://127.0.0.1:3000/health` returns HTTP 200 with `{"status":"ok"}`
- [ ] `.env.production` contains valid `RESEND_API_KEY`, `CONTACT_EMAIL`, `FROM_EMAIL`
- [ ] `FROM_EMAIL` domain is verified in Resend dashboard
- [ ] Nginx config is valid: `sudo nginx -t`
- [ ] PM2 process list is saved: `pm2 save`
- [ ] SSL certificate is valid: `sudo certbot certificates`
