# 📋 MASTER TODO — Frontend Deploy + Split CI/CD
- Started: 2026-06-27 14:03 UTC+7
- Agent: Cursor AI

---

## TASK 0 — Setup workspace
- [x] 0.1 Tạo folder .cursor-workspace và các subfolder ✅ (tồn tại từ session trước)
- [x] 0.2 Tạo MASTER_TODO.md này ✅

## TASK 1 — Cập nhật NestJS Backend
- [ ] 1.1 Thêm global prefix /api vào main.ts + CORS
- [ ] 1.2 Commit và push → CI/CD tự deploy lại backend
- [ ] 1.3 Verify: curl https://thanhhaidev.me/api/

## TASK 2 — Tách CI/CD thành 2 pipeline
- [ ] 2.1 Tạo .github/workflows/deploy-backend.yml
- [ ] 2.2 Tạo .github/workflows/deploy-frontend.yml
- [ ] 2.3 Xóa .github/workflows/deploy.yml cũ
- [ ] 2.4 Commit và push
- [ ] 2.5 Verify: chỉ đúng pipeline trigger khi thay đổi đúng folder

## TASK 3 — Chuẩn bị Next.js cho Docker
- [x] 3.1 Thêm output: 'standalone' vào next.config.ts ✅ (session trước)
- [x] 3.2 Tạo client/.env.production ✅ (session trước)
- [ ] 3.3 Tạo client/Dockerfile
- [ ] 3.4 Tạo client/.dockerignore
- [ ] 3.5 Tạo client/docker-compose.yml

## TASK 4 — Cập nhật Nginx trên VPS
- [ ] 4.1 SSH vào VPS
- [ ] 4.2 Sửa /etc/nginx/sites-available/thanhhaidev.me
- [ ] 4.3 nginx -t && systemctl reload nginx
- [ ] 4.4 Verify nginx config

## TASK 5 — Deploy Frontend lần đầu (thủ công)
- [ ] 5.1 SSH vào VPS, clone/pull repo
- [ ] 5.2 docker-compose up -d --build
- [ ] 5.3 Verify: curl http://localhost:3001

## TASK 6 — Smoke test toàn bộ
- [ ] 6.1 curl https://thanhhaidev.me/ → Next.js response
- [ ] 6.2 curl https://thanhhaidev.me/api/ → NestJS response
- [ ] 6.3 Kiểm tra docker ps trên VPS (2 container chạy)
- [ ] 6.4 Kiểm tra Nginx logs

## FINAL SUMMARY
| Task | Status | Notes |
|------|--------|-------|
| Task 0 — Workspace setup | ✅ | Dirs tồn tại từ session trước |
| Task 1 — NestJS /api prefix | 🔄 | |
| Task 2 — Split CI/CD | ⏳ | |
| Task 3 — Next.js Docker | 🔄 | Standalone + env done, cần Docker files |
| Task 4 — Nginx update | ⏳ | |
| Task 5 — Frontend deploy | ⏳ | |
| Task 6 — Smoke test | ⏳ | |
