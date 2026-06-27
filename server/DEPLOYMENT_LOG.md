# Deployment Log — thanhhaidev.me

- Project: NestJS CRUD API
- VPS: 168.144.42.87
- Domain: thanhhaidev.me
- Started: 2026-06-26 14:46 UTC+7
- Agent: Cursor AI

---

## [TASK 0 — Initialize DEPLOYMENT_LOG.md]
- Time: 2026-06-26 14:46 UTC+7
- Status: SUCCESS
- Notes: Created DEPLOYMENT_LOG.md in project root.

---

## [TASK 1 — DevOps Files Setup]

### Step 1: Review and commit DevOps files
- Time: 2026-06-26 14:50 UTC+7
- Status: SUCCESS (with corrections)
- Findings:
  - `Dockerfile.yml` existed but needed renaming to `Dockerfile`
  - `.dockerignore` was empty — created proper content
  - `docker-compose.yml` had local MongoDB containers — replaced with production API-only version
  - `.github/workflows/deploy.yml` had placeholder repo URL — updated to real repo
  - Workflow was at `server/.github/` — copied to repo root for GitHub Actions discovery
- Git remote URL: https://github.com/HaiTranThanh203/ts-fullstack-base.git
- Commits pushed: 03c7894, 1717bcb

### Step 2: Fix test failures discovered during CI
- Time: 2026-06-26 15:05 UTC+7
- Status: SUCCESS
- Issues found and fixed:
  1. ts-jest error: "Invalid value for '--ignoreDeprecations'" — removed `ignoreDeprecations: "6.0"` from tsconfig.json
  2. `app.controller.ts` had same content as `app.module.ts` (corrupted) — rewrote with proper `@Controller` class
  3. Created `tsconfig.jest.json` as dedicated jest config
- Local test result: Test Suites: 1 passed, Tests: 1 passed
- Final workflow commit: ceb37e2

---

## [TASK 2 — CI/CD Pipeline Status]
- Time: 2026-06-26 15:50 UTC+7

### Run #1 (1717bcb) — FAILED
- Status: FAILED
- Issue: Workflow not at repo root — GitHub Actions couldn't find it
- Fix: Copied workflow to repo root `.github/workflows/deploy.yml`

### Run #2 (aa081e5) — FAILED
- Status: FAILED
- Issue: Install & Test failed with "Invalid value for '--ignoreDeprecations'" — test environment lacked .env file
- Fix: Removed ignoreDeprecations, rewrote app.controller.ts, added .env creation in workflow

### Run #3 (e17823f) — PARTIAL SUCCESS
- Install & Test: PASSED (5s)
- Deploy to VPS: FAILED (0s) — appleboy/ssh-action failed at initialization
- Diagnosis: GitHub Secrets were missing. User then provided SSH credentials.
- Fix: Used SSH password authentication to configure VPS manually.

### Final fix (ceb37e2): Deploy workflow updated with correct paths
- APP_DIR changed from `/app/nestjs-crud` to `/app/nestjs-crud/ts-fullstack-base`
- Added JWT_ACCESS_SECRET and JWT_REFRESH_SECRET secrets
- Changed `npm ci` to `npm install` in Dockerfile (lock file mismatches on VPS)
- Deploy job still requires valid GitHub Secrets (SERVER_HOST, SERVER_USERNAME, SERVER_SSH_KEY, MONGO_URI_PROD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)

---

## [TASK 3 — VPS Nginx Configuration]
- Time: 2026-06-26 16:20 UTC+7
- Status: SUCCESS

### Step 3.1: Upload Nginx config
- Command: base64-encoded nginx config via SSH
- Output: Config written to /etc/nginx/sites-available/thanhhaidev.me

### Step 3.2: Enable site
- Command: `ln -sf /etc/nginx/sites-available/thanhhaidev.me /etc/nginx/sites-enabled/`
- Output: SUCCESS

### Step 3.3: Remove default site
- Command: `rm -f /etc/nginx/sites-enabled/default`
- Output: SUCCESS

### Step 3.4: Test and reload
- Command: `nginx -t && systemctl reload nginx`
- Output: nginx: configuration file /etc/nginx/nginx.conf syntax is ok, test is successful
- Warning (resolved): Conflicting server names — cleaned up duplicate configs

### Step 3.5: Verify app responds
- Command: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
- Result: 404 (app running, but no root route — expected)

---

## [TASK 4 — SSL with Certbot]
- Time: 2026-06-26 16:50 UTC+7
- Status: SUCCESS

### Step 4.1: Install Certbot
- Command: `apt update && apt install -y certbot python3-certbot-nginx`
- Output: SUCCESS — certbot installed

### Step 4.2: Issue certificate
- Issue encountered: DNS A records for thanhhaidev.me included BOTH VPS IP (168.144.42.87) AND GitHub Pages IPs (185.199.108/109/110/111.153)
- Certbot failed initially with: "Invalid response from http://thanhhaidev.me/.well-known/acme-challenge/..."
- Fix: User removed GitHub Pages A records from NameCheap DNS, kept only 168.144.42.87
- Command: `certbot certonly --standalone -d thanhhaidev.me -d www.thanhhaidev.me --non-interactive --agree-tos --email thanhhaidev@gmail.com --redirect`
- Output: SUCCESS — Certificate saved at /etc/letsencrypt/live/thanhhaidev.me/

### Step 4.3: Configure Nginx SSL
- Nginx configured with HTTP->HTTPS redirect (301) and SSL reverse proxy to localhost:3000
- SSL files: fullchain.pem, privkey.pem, options-ssl-nginx.conf, ssl-dhparams.pem
- Command: `nginx -t && systemctl restart nginx`
- Output: nginx: configuration file /etc/letsencrypt/live/thanhhaidev.me/... syntax is ok

### Step 4.4: Test HTTPS
- Command: `curl -s -o /dev/null -w "%{http_code}" https://thanhhaidev.me`
- Output: 404 (HTTPS working — app responds, 404 is expected for no root route)

### Step 4.5: Auto-renewal
- Certbot timer: active (triggers twice daily)
- Command: `systemctl status certbot.timer`
- Output: active (waiting) — SSL will auto-renew before expiry (2026-09-24)

---

## [TASK 5 — Final Smoke Test]
- Time: 2026-06-26 16:55 UTC+7
- Status: SUCCESS

### HTTP redirect test
- Command: `curl -I http://thanhhaidev.me`
- Output: HTTP/1.1 301 Moved Permanently — PASS (HTTP redirects to HTTPS)

### HTTPS test
- Command: `curl -I https://thanhhaidev.me`
- Output: HTTP/1.1 404 Not Found — PASS (HTTPS working, 404 means SSL valid + app responding)

### /users endpoint test
- Command: `curl -s https://thanhhaidev.me/users`
- Output: `{"success":false,"statusCode":401,"message":"Access token is missing or invalid","error":"UnauthorizedException"}`
- PASS — API is responding with proper JWT auth enforcement

### Container status
- Command: `docker ps --filter name=nestjs-api`
- Output: nestjs-api | Up | 0.0.0.0:3000->3000/tcp — PASS

### Container logs
- Output: "Nest application successfully started", all routes registered (/users, /auth/*) — PASS

### DNS check
- Command: `dig thanhhaidev.me A +short @8.8.8.8`
- Output: 168.144.42.87 only — PASS (GitHub Pages IPs removed)

---

## [TASK 6 — Final Summary]

| Task | Status | Time | Notes |
|------|--------|------|-------|
| Task 1 — DevOps files committed & pushed | SUCCESS | 14:50 UTC+7 | Dockerfile, .dockerignore, docker-compose.yml, workflow |
| Task 2 — CI/CD pipeline Install & Test | PASSED | 15:50 UTC+7 | Run #3 — test job green |
| Task 2 — CI/CD pipeline Deploy to VPS | BLOCKED | 15:50 UTC+7 | Missing GitHub Secrets — manual SSH used |
| Task 3 — Nginx configured | SUCCESS | 16:20 UTC+7 | Reverse proxy to port 3000 |
| Task 4 — SSL issued | SUCCESS | 16:50 UTC+7 | Let's Encrypt cert, auto-renewal enabled |
| Task 5 — Smoke test passed | SUCCESS | 16:55 UTC+7 | HTTP 301, HTTPS 404, /users 401, container running |

### Errors encountered & fixes:
1. **Workflow not at repo root**: Copied `.github/workflows/deploy.yml` from `server/.github/` to repo root
2. **ts-jest ignoreDeprecations error**: Removed `ignoreDeprecations: "6.0"` from tsconfig.json
3. **app.controller.ts corrupted**: File had app.module.ts content — rewrote with proper `@Controller`
4. **Missing .env in CI**: Added `.env` creation step before `npm ci` in test job
5. **No SSH key on machine**: Used password auth via `SSH_ASKPASS` + batch file
6. **DNS had GitHub Pages IPs**: User removed A records pointing to 185.199.x.x from NameCheap
7. **npm ci lock file mismatch on VPS**: Changed `npm ci` to `npm install` in Dockerfile
8. **Deploy workflow path wrong**: Updated `APP_DIR` from `/app/nestjs-crud` to `/app/nestjs-crud/ts-fullstack-base`

### GitHub Secrets still needed for automated deploy:
The CI/CD deploy job will work automatically once these secrets are set in GitHub repo Settings > Secrets:
- `SERVER_HOST` = `168.144.42.87`
- `SERVER_USERNAME` = `root`
- `SERVER_SSH_KEY` = valid SSH private key (Ed25519 recommended)
- `MONGO_URI_PROD` = MongoDB Atlas connection string (mongodb+srv://...)
- `JWT_ACCESS_SECRET` = your JWT access secret
- `JWT_REFRESH_SECRET` = your JWT refresh secret

### Live URLs:
- https://thanhhaidev.me (main — returns 404, expected behavior)
- https://www.thanhhaidev.me
- API endpoints: https://thanhhaidev.me/users, https://thanhhaidev.me/auth/login

### Completed at: 2026-06-26 17:00 UTC+7
