$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_debug2.txt"
$errPath = "$env:TEMP\ssh_debug2_err.txt"

function Run-SSH {
    param($cmd)
    $proc = Start-Process -FilePath "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
        -ArgumentList "-o","StrictHostKeyChecking=no","-o","ConnectTimeout=15","-o","PreferredAuthentications=password","-o","PubkeyAuthentication=no","-o","BatchMode=no","root@168.144.42.87",$cmd `
        -NoNewWindow -Wait -PassThru `
        -RedirectStandardOutput $outPath `
        -RedirectStandardError $errPath
    Write-Host "  [EXIT $($proc.ExitCode)]"
    $stdout = (Get-Content $outPath -Raw)
    if ($stdout -and $stdout.Trim()) { Write-Host "  STDOUT: $($stdout.Trim())" }
    return $proc.ExitCode
}

Write-Host "=== 1. Kiem tra /health truc tiep tren port 3000 (khong qua nginx) ==="
Run-SSH "curl -s http://localhost:3000/health 2>&1"

Write-Host "`n=== 2. Kiem tra logs ==="
Run-SSH "docker logs nestjs-api --tail 5 2>&1"

Write-Host "`n=== 3. Check container dang o trang thai gi ==="
Run-SSH "docker inspect nestjs-api --format '{{.State.Status}}'"

Write-Host "`n=== 4. Check network ==="
Run-SSH "docker network ls --format 'table {{.Name}}\t{{.Driver}}'"
Run-SSH "docker network inspect bridge --format '{{range .Containers}}{{.Name}} {{end}}'"

Write-Host "`n=== 5. Thử rebuild với network đúng ==="
# Stop current container
Run-SSH "docker rm -f nestjs-api 2>/dev/null || true"
# Create same network
Run-SSH "docker network create nestjs_network 2>/dev/null || true"
# Run with network
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker run -d --name nestjs-api --restart unless-stopped -p 3000:3000 --network nestjs_network --env-file .env nestjs-api:latest 2>&1"
Run-SSH "sleep 20 && docker ps --format 'table {{.Names}}\t{{.Status}}'"
Run-SSH "docker logs nestjs-api --tail 10 2>&1"
Run-SSH "curl -s http://localhost:3000/health 2>&1"
