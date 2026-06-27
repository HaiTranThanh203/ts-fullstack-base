# Local Dev Test — Task 3

## Step 3.1 — Dev Server

Command: `npm run dev` trong `client/`

**Kết quả mong đợi:**
- Dev server chạy tại http://localhost:3000
- Trang hiển thị:
  - Header: "🚀 thanhhaidev.me" + "Frontend đã deploy thành công"
  - Card "Frontend": "✅ Next.js đang chạy"
  - Card "Backend API": kết quả fetch từ backend
  - Footer: "NestJS + Next.js · Docker · Nginx · VPS"

## Step 3.2 — Production Build

Command: `npm run build` trong `client/`

**Success criteria:**
- Build kết thúc không lỗi
- Xuất hiện `.next/standalone/` directory
- Exit code = 0

## Ghi chú

- Backend API `http://localhost:3000/api` cần đang chạy để hiển thị status đúng
- Trên production: `NEXT_PUBLIC_API_URL=https://thanhhaidev.me/api`
