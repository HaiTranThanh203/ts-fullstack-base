# Standalone Output — next.config.ts

## Config

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
};
```

## Giải thích

`output: 'standalone'` yêu cầu Next.js tạo ra một bản build độc lập trong `.next/standalone/`.

Thư mục này chứa đủ file để chạy server mà không cần `node_modules` gốc — chỉ cần copy thư mục này vào Docker image cùng với `node_modules` (hoặc cài lại trong image).

## Cấu trúc sau build

```
.next/standalone/
├── server/
│   ├── app/
│   ├── pages/
│   └── ...
├── .next/           ← static assets
├── package.json
└── server.js        ← entry point
```

## Lợi ích

- Docker image nhỏ hơn (không cần copy toàn bộ source)
- Deploy nhanh hơn
- Production-ready trên VPS
