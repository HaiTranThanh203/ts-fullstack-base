# 🏗️ Architecture & Port Map — thanhhaidev.me

## Sơ đồ luồng request (Request Flow)

```
[User/Browser]
      │
      │ HTTPS :443
      ▼
┌─────────────────────────┐
│         NGINX           │  ← Reverse Proxy + SSL Termination
│   /etc/nginx/sites-...  │
│   Port 80  (HTTP)       │  → redirect 301 → HTTPS
│   Port 443 (HTTPS)      │  → proxy_pass → localhost:3000
└────────────┬────────────┘
             │
             │ HTTP localhost:3000
             │ (traffic nội bộ VPS, không ra internet)
             ▼
┌─────────────────────────┐
│    Docker Container     │
│    (nestjs-api)         │
│    Port 3000            │
│    NestJS REST API      │
└────────────┬────────────┘
             │
             │ TCP (MongoDB Wire Protocol)
             │ qua internet (TLS encrypted)
             ▼
┌─────────────────────────┐
│     MongoDB Atlas       │
│     (Cloud Database)    │
│     Port 27017          │
│     IP Whitelist:       │
│     168.144.42.87       │
└─────────────────────────┘
```

---

## Bảng port & service

| Service | Port | Protocol | Nghe từ đâu | Ghi chú |
|---------|------|----------|-------------|---------|
| Nginx | **80** | HTTP | 0.0.0.0 (internet) | Redirect sang 443 |
| Nginx | **443** | HTTPS | 0.0.0.0 (internet) | Entry point chính |
| NestJS (Docker) | **3000** | HTTP | localhost only | KHÔNG expose ra ngoài |
| MongoDB Atlas | **27017** | TCP/TLS | Atlas Cloud | KHÔNG trên VPS |
| SSH | **22** | TCP | 0.0.0.0 | GitHub Actions dùng để deploy |

> ⚠️ **Quan trọng:** Port 3000 chỉ bind `localhost`, không accessible từ internet trực tiếp. Mọi traffic đều phải đi qua Nginx.

---

## Cấu trúc thư mục trên VPS

```
/
├── etc/
│   └── nginx/
│       ├── sites-available/
│       │   └── thanhhaidev.me     ← Nginx config
│       └── sites-enabled/
│           └── thanhhaidev.me     ← Symlink đến sites-available
│
└── app/
    └── nestjs-crud/               ← Thư mục deploy (git clone vào đây)
        ├── .env                   ← Được tạo động bởi CI/CD (KHÔNG commit)
        ├── docker-compose.yml
        ├── Dockerfile
        └── dist/                  ← TypeScript đã được build (trong container)
```

---

## Cấu trúc thư mục trong GitHub Repo

```
your-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml         ← CI/CD pipeline
├── src/                       ← NestJS source code
├── test/                      ← Jest test files
├── Dockerfile                 ← Multi-stage build
├── docker-compose.yml         ← Chạy 1 service: api
├── .dockerignore
└── nginx-thanhhaidev.me.conf  ← Tham khảo, copy lên VPS thủ công
```

---

## SSL Certificate

| Thông tin | Giá trị |
|-----------|---------|
| Provider | Let's Encrypt (free) |
| Tool | Certbot |
| Auto-renewal | Có (cron job tự động) |
| Vị trí cert | `/etc/letsencrypt/live/thanhhaidev.me/` |
| Thời hạn | 90 ngày (tự gia hạn) |

---

## GitHub Secrets đã cấu hình

| Secret Name | Dùng trong | Mô tả |
|-------------|-----------|-------|
| `SERVER_HOST` | deploy.yml | IP của VPS: `168.144.42.87` |
| `SERVER_USERNAME` | deploy.yml | `root` |
| `SERVER_SSH_KEY` | deploy.yml | Private key (ed25519) |
| `MONGO_URI_PROD` | deploy.yml → .env | Connection string Atlas |

---

## Giao tiếp giữa các thành phần

```
GitHub Actions Runner
    ↓ SSH (port 22) → VPS
    ↓ Chạy script: git pull + tạo .env + docker-compose up

VPS (Nginx)
    ↓ Nhận request từ internet (80/443)
    ↓ Proxy sang localhost:3000

Docker Container (NestJS)
    ↓ Xử lý business logic
    ↓ Kết nối MongoDB Atlas qua MONGO_URI trong .env

MongoDB Atlas
    ↓ Xác thực IP (whitelist 168.144.42.87)
    ↓ Trả data về cho NestJS
```