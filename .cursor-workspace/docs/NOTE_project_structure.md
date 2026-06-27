# Project Structure — client/

Sau khi chạy `create-next-app`, cấu trúc folder:

```
client/
├── app/
│   ├── layout.tsx       ← Root layout với metadata
│   ├── page.tsx        ← Trang chủ (đã custom)
│   ├── favicon.ico
│   └── globals.css     ← Global styles + Tailwind
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── .next/              ← Build output (generated)
├── node_modules/       ← Dependencies (generated)
├── .gitignore          ← Git ignore
├── AGENTS.md           ← Next.js agents instructions
├── eslint.config.mjs   ← ESLint config
├── next.config.ts      ← Next.js config (đã sửa: output: standalone)
├── package.json        ← Dependencies + scripts
├── package-lock.json
├── postcss.config.mjs  ← PostCSS config (Tailwind v4)
├── README.md
└── tsconfig.json       ← TypeScript config
```

**Notes:**
- Next.js 16.2.9 với React 19.2.4
- Tailwind CSS v4 (dùng @tailwindcss/postcss)
- TypeScript 5
- ESLint 9
- App Router (không dùng src/)
- Import alias: `@/*` → `./`
