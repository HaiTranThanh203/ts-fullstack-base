# 📋 Deployment Todo — Step by Step

> Dành cho AI Agent hoặc Developer thực thi. Mỗi bước có lệnh cụ thể và điều kiện kiểm tra.

---

## ✅ Đã hoàn thành (DONE — Không cần làm lại)

- [x] VPS Ubuntu khởi tạo trên DigitalOcean
- [x] Cài: `docker.io`, `docker-compose`, `nginx`, `git`
- [x] SSH Key (ed25519) tạo trên VPS, Public Key nạp vào `authorized_keys`
- [x] MongoDB Atlas: Network Access + Database User + Connection String
- [x] DNS: A Record `thanhhaidev.me` → `168.144.42.87`
- [x] GitHub Secrets: `SERVER_HOST`, `SERVER_USERNAME`, `SERVER_SSH_KEY`, `MONGO_URI_PROD`

---

## 🚀 Các bước cần thực hiện

### BƯỚC 1 — Thêm files vào GitHub Repo

**Thực hiện tại:** Máy local của developer

**Files cần commit:**
```
Dockerfile
.dockerignore
docker-compose.yml
.github/workflows/deploy.yml
```

**Lệnh:**
```bash
git add Dockerfile .dockerignore docker-compose.yml .github/workflows/deploy.yml
git commit -m "chore: add Docker and CI/CD configuration"
git push origin main
```

**⚠️ Quan trọng trước khi push:**
- Mở file `.github/workflows/deploy.yml`
- Tìm dòng: `git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git`
- Thay `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` bằng repo thực của bạn

**Kiểm tra:** GitHub Actions tab → thấy pipeline chạy ✓

---

### BƯỚC 2 — Kiểm tra CI/CD Pipeline lần đầu

**Thực hiện tại:** GitHub.com → Repo → tab "Actions"

**Quan sát:**
- Job "Install & Test" → phải xanh ✓
- Job "Deploy to VPS" → phải xanh ✓

**Nếu Job Test fail:**
```
Nguyên nhân thường gặp:
- Test đang fail (chạy npm run test locally để kiểm tra)
- Thiếu biến môi trường cho test (cần thêm secrets hoặc mock)
```

**Nếu Job Deploy fail:**
```
Kiểm tra:
1. SSH key có đúng format không (phải là Private Key, bắt đầu bằng -----BEGIN OPENSSH PRIVATE KEY-----)
2. SERVER_HOST có đúng IP không
3. VPS có đang chạy không (ping 168.144.42.87)
```

---

### BƯỚC 3 — Cấu hình Nginx trên VPS

**Thực hiện tại:** VPS (SSH vào: `ssh root@168.144.42.87`)

**3.1 — Tạo file config:**
```bash
sudo nano /etc/nginx/sites-available/thanhhaidev.me
```
Paste nội dung từ file `nginx-thanhhaidev.me.conf` trong repo.

**3.2 — Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/thanhhaidev.me /etc/nginx/sites-enabled/
```

**3.3 — Xóa default config (tránh conflict):**
```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

**3.4 — Test và reload:**
```bash
sudo nginx -t
# Output phải là: syntax is ok + test is successful

sudo systemctl reload nginx
```

**Kiểm tra:**
```bash
curl http://thanhhaidev.me/
# Phải nhận được response từ NestJS (không phải Nginx default page)
```

---

### BƯỚC 4 — Cài SSL với Certbot (HTTPS)

**Thực hiện tại:** VPS

**4.1 — Cài Certbot:**
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

**4.2 — Cấp chứng chỉ SSL:**
```bash
sudo certbot --nginx -d thanhhaidev.me -d www.thanhhaidev.me
```

**Trong quá trình chạy, Certbot sẽ hỏi:**
- Email của bạn → nhập email thật (để nhận cảnh báo hết hạn)
- Đồng ý Terms of Service → nhập `Y`
- Chia sẻ email với EFF → tùy chọn, `N` cũng được
- Redirect HTTP → HTTPS → chọn `2` (Redirect, khuyến nghị)

**4.3 — Kiểm tra SSL:**
```bash
curl https://thanhhaidev.me/
# Phải trả về response từ NestJS qua HTTPS
```

**4.4 — Kiểm tra auto-renewal:**
```bash
sudo certbot renew --dry-run
# Output: Congratulations, all simulated renewals succeeded
```

---

### BƯỚC 5 — Kiểm tra toàn diện (Smoke Test)

**Thực hiện từ máy bất kỳ:**

```bash
# Test HTTP redirect
curl -I http://thanhhaidev.me
# Expected: 301 Moved Permanently → Location: https://...

# Test HTTPS
curl -I https://thanhhaidev.me
# Expected: 200 OK (hoặc response từ NestJS)

# Test API endpoint (thay /api bằng route thực của bạn)
curl https://thanhhaidev.me/api
```

**Trên VPS — kiểm tra container:**
```bash
# Xem container có đang chạy không
docker ps

# Xem logs của NestJS
docker logs nestjs-api

# Xem logs Nginx
sudo tail -f /var/log/nginx/thanhhaidev.me.access.log
```

---

## 🔄 Workflow sau khi setup xong

Từ lần tiếp theo, chỉ cần:
```bash
git push origin main
```
→ GitHub Actions tự động:
1. Chạy tests
2. SSH vào VPS
3. Pull code mới
4. Rebuild Docker image
5. Restart container

**Không cần SSH vào VPS thủ công nữa.**

---

## 🛠️ Troubleshooting nhanh

| Vấn đề | Lệnh kiểm tra | Fix |
|--------|---------------|-----|
| Container không chạy | `docker ps -a` | `docker logs nestjs-api` để xem lỗi |
| Port 3000 không response | `curl localhost:3000` | Kiểm tra .env có MONGO_URI chưa |
| Nginx 502 Bad Gateway | `docker ps` | Container bị crash, xem `docker logs nestjs-api` |
| SSL cert hết hạn | `sudo certbot renew` | Thường auto-renew, kiểm tra cron |
| Deploy không trigger | GitHub Actions tab | Kiểm tra branch name có phải `main` không |

---

## 📌 Thông tin quan trọng cần lưu

| Thông tin | Giá trị |
|-----------|---------|
| VPS IP | `168.144.42.87` |
| Domain | `thanhhaidev.me` |
| App directory trên VPS | `/app/nestjs-crud` |
| Container name | `nestjs-api` |
| App port | `3000` |
| MongoDB | Atlas Cloud (không trên VPS) |