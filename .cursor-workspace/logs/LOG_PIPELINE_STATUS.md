# Pipeline Status — 2026-06-27 07:35 UTC

## Active Pipeline
- **Run #28282581060** — Deploy Frontend #3
- Commit: `3565259` (docs: add production deployment info to client README)
- Started: 07:30:33 UTC
- URL: https://github.com/HaiTranThanh203/ts-fullstack-base/actions/runs/28282581060

## Workflow Steps (Deploy Frontend #3)
This run uses the UPDATED deploy-frontend.yml with:
1. Nginx SSL config (port 80 → 443 redirect, Let's Encrypt certs)
2. docker-compose down before up (clean restart)
3. Verbose logging (docker-compose logs output)

## Previous Runs
| Run | Commit | Result | Issue |
|-----|--------|--------|--------|
| #1 | 947d359 | ✅ SUCCESS | Pipeline ran old config (no SSL) |
| #2 | e6ac8af | ✅ SUCCESS | Old workflow (no SSL, no docker-compose down) |
| #3 | 3565259 | 🔄 RUNNING | New workflow with SSL + verbose logging |

## Expected Duration
- Nginx reload: ~30s
- Git clone/pull: ~1-2min
- Docker build: ~3-5min
- Docker startup: ~30s
Total: ~5-10 minutes

## Verification After Pipeline
- `curl https://thanhhaidev.me/` → Next.js HTML
- `curl https://thanhhaidev.me/api/` → NestJS 401/200
- `curl https://thanhhaidev.me/api/docs` → Swagger UI
