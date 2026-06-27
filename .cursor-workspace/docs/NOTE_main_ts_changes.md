# Changes to server/src/main.ts

## What changed

1. **`app.setGlobalPrefix("api")`** — Thêm prefix `/api` cho tất cả routes
   - Trước: `/users` → Sau: `/api/users`
   - Swagger docs: `/api/docs` (đã có sẵn trong code)

2. **`app.enableCors({...})`** — Bật CORS
   - `origin`: cho phép frontend domain + localhost dev
   - `credentials`: cho phép gửi cookies/auth headers cross-origin

3. **`PORT || 3000`** — Default port 3000 thay vì 8080

## Tại sao cần global prefix

- Nginx config dùng `location /api/` để proxy sang backend
- Backend nhận request đã strip `/api/` prefix tự nhiên khi NestJS thêm global prefix
- Frontend gọi `https://thanhhaidev.me/api/...` → Nginx forward → NestJS nhận `/api/...` → NestJS strip prefix → controller nhận `/...`
- Swagger docs tại `https://thanhhaidev.me/api/docs`
