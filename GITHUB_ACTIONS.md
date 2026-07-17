# Roseair Logistics — GitHub Actions

Two workflows: **CI** (verify every push) and **Deploy** (production deployment).

Repository: `https://github.com/theycallmeSeed/Roseair_Logistics`

## Workflows

### `ci.yml` — Continuous Integration

Triggers on every push to `main`/`develop` and every PR to `main`.

| Step | What it does |
|---|---|
| Checkout | Clones the repository |
| Setup Node 20 | Installs Node 20 LTS |
| Cache npm | Caches `~/.npm` and `node_modules` for faster installs |
| `npm ci` | Clean install (including dev dependencies) |
| `npm run lint` | ESLint + Prettier check |
| `npm run build` | Vite production build (client + SSR) |
| Verify artifacts | Confirms `dist/client` and `dist/server` exist and have files |

If any step fails, the pipeline fails. The pipeline blocks merging if it fails on a PR.

### `deploy.yml` — Production Deployment

Triggers on push to `main` or manually via `workflow_dispatch`.

**Job 1: `verify`** — Runs the same CI steps as above. Deployment will **not** proceed if `verify` fails.

**Job 2: `deploy`** — Runs only if `verify` succeeded.

| Step | What it does |
|---|---|
| Setup SSH agent | Loads the deploy SSH key |
| Add server to known hosts | `ssh-keyscan` to prevent host key prompts |
| Deploy | SSH into production, runs `bash deploy/deploy.sh main` |
| Health check against `/health` | SSH into production, runs `bash deploy/healthcheck.sh` (checks the JSON health endpoint) |
| **Rollback** (if either step fails) | SSH into production, runs `echo "y" | bash deploy/rollback.sh` |
| Status report | Prints success/failure with commit SHA and exit codes |

## Required GitHub Secrets

Create these in **GitHub → Settings → Secrets and variables → Actions** for the repository.

| Secret | Description | Example |
|---|---|---|
| `SSH_PRIVATE_KEY` | Private SSH key for SSH into the production server | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_HOST` | Production server hostname or IP | `roseairlogistics.com` |
| `SSH_USER` | SSH user on the production server | `deploy`, `root`, `ubuntu` |
| `SSH_PORT` | SSH port (defaults to 22 if omitted) | `22` |
| `DEPLOY_PATH` | Deployment path on the server (defaults to `/opt/roseair`) | `/opt/roseair` |

## First Setup

### 1. Add GitHub Secrets

Navigate to: `https://github.com/theycallmeSeed/Roseair_Logistics/settings/secrets/actions`

Add each secret from the table above.

### 2. Generate and Install SSH Key

The deploy workflow needs SSH access from GitHub Actions runners to your production server.

```bash
# On your local machine, generate a deploy key (no passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/roseair-deploy

# Copy the public key to the production server
ssh-copy-id -i ~/.ssh/roseair-deploy.pub deploy@roseairlogistics.com
# Or manually append the public key to ~/.ssh/authorized_keys on the server

# Copy the private key content to add as SSH_PRIVATE_KEY secret
cat ~/.ssh/roseair-deploy
# Output starts with: -----BEGIN OPENSSH PRIVATE KEY-----
```

### 3. Verify Server Has Git Access

The `deploy.sh` script clones the repository via SSH (`git@github.com:theycallmeSeed/Roseair_Logistics.git`). The production server must have its own deploy key for GitHub:

```bash
# On the production server
ssh-keygen -t ed25519 -C "prod-deploy" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Add this public key to GitHub: `https://github.com/theycallmeSeed/Roseair_Logistics/settings/keys` (as a **Deploy Key** with read-only access).

Test the connection:
```bash
ssh -T git@github.com
# Expected: "Hi theycallmeSeed/Roseair_Logistics! You've successfully authenticated..."
```

### 4. Verify First Deployment

Push to `main` and watch the workflow at:
`https://github.com/theycallmeSeed/Roseair_Logistics/actions`

Or trigger manually: **Actions → Deploy → Run workflow → main**.

## Deployment Flow

```
Push to main (or manual trigger)
        │
        ▼
  ┌──────────┐
  │  verify  │  ← npm ci, lint, build, check artifacts
  └────┬─────┘
       │ success?
       ├── NO → ❌ Pipeline fails. Fix and push again.
       │
       ├── YES
       │
       ▼
  ┌──────────┐
  │  deploy  │  ← SSH into production, run deploy.sh
  └────┬─────┘
       │
       ▼
  ┌──────────────────┐
  │ healthcheck /health │  ← JSON endpoint validates app
  └──────┬───────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  success   failure
     │         │
     │         ▼
     │    ┌──────────┐
     │    │ rollback │  ← echo y | rollback.sh
     │    └────┬─────┘
     │         │
     │         ▼
     │    ❌ Pipeline fails
     │
     ▼
  ✅ Success
```

## Rollback Flow

Rollback is automatic when:

1. **Deploy step fails** — `npm ci`, `npm run build`, or `pm2 reload` error on the server
2. **Health check fails** — `/health` endpoint returns non-200, missing required JSON fields, or PM2 is offline

The rollback:
1. Runs `echo "y" | bash deploy/rollback.sh` (auto-confirms when piped)
2. Validates the target release has `ecosystem.config.cjs`, `dist/server`, `dist/client`
3. Updates the `current` symlink
4. Restarts PM2 with the previous build
5. The deployment workflow exits with failure status

### Manual Rollback

```bash
# SSH into production and run:
bash /opt/roseair/current/deploy/rollback.sh
# Or for a specific release:
bash /opt/roseair/current/deploy/rollback.sh 20260706120000
```

## Monitoring Deployments

1. **GitHub Actions tab**: `https://github.com/theycallmeSeed/Roseair_Logistics/actions`
2. **Production logs**: `pm2 logs roseair` on the server
3. **Nginx logs**: `tail -f /var/log/nginx/roseair-error.log`

## Troubleshooting

### SSH connection refused

```bash
nc -zv roseairlogistics.com 22
sudo ufw status
sudo cat ~/.ssh/authorized_keys
```

### Deploy key not working

```bash
# On production server:
ssh -T git@github.com
# Should not ask for password
ssh-add -l
```

### Deployment fails but no rollback

```bash
# Manually rollback via SSH:
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST \
  "cd /opt/roseair && echo y | bash current/deploy/rollback.sh"
```

### Health check fails after deploy

The server might still be starting. Verify:

```bash
pm2 status
pm2 logs roseair --lines 20
curl -f http://127.0.0.1:3000/health
```
