$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_run.txt"
$errPath = "$env:TEMP\ssh_run_err.txt"

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

Write-Host "=== 1. Xoa container cu (neu co) ==="
Run-SSH "docker rm -f nestjs-api 2>/dev/null || true"

Write-Host "`n=== 2. Pull latest code ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base && git stash 2>/dev/null || true"
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base && git checkout -- . && git pull origin main 2>&1"

Write-Host "`n=== 3. Rebuild image ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose build 2>&1 | tail -5"

Write-Host "`n=== 4. Xoa container cu hoan toan ==="
Run-SSH "docker rm -f nestjs-api 2>/dev/null || true"
Run-SSH "docker ps -a --filter name=nestjs-api --format '{{.Names}}'"

Write-Host "`n=== 5. Start container truc tiep bang docker run ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker run -d --name nestjs-api --restart unless-stopped -p 3000:3000 --env-file .env nestjs-api:latest 2>&1"

Write-Host "`n=== 6. Kiem tra ==="
Run-SSH "sleep 20 && docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

Write-Host "`n=== 7. Logs ==="
Run-SSH "docker logs nestjs-api --tail 15 2>&1"

Write-Host "`n=== 8. Test /health ==="
Run-SSH "curl -s https://thanhhaidev.me/health"
