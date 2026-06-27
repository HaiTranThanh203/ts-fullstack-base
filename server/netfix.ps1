$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_netfix.txt"
$errPath = "$env:TEMP\ssh_netfix_err.txt"

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

Write-Host "=== 1. Remove container ==="
Run-SSH "docker rm -f nestjs-api 2>/dev/null || true"

Write-Host "`n=== 2. Check network of mongodb ==="
Run-SSH "docker inspect nestjs-mongodb --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool 2>/dev/null || docker inspect nestjs-mongodb --format '{{range \$k,\$v := .NetworkSettings.Networks}}{{printf `"%s `" \$k}}{{end}}'"

Write-Host "`n=== 3. Run container on same network as mongodb ==="
Run-SSH "docker run -d --name nestjs-api --restart unless-stopped -p 3000:3000 --network server_nestjs_network --env-file /app/nestjs-crud/ts-fullstack-base/server/.env nestjs-api:latest 2>&1"

Write-Host "`n=== 4. Kiem tra ==="
Run-SSH "sleep 20 && docker ps --format 'table {{.Names}}\t{{.Status}}'"

Write-Host "`n=== 5. Logs ==="
Run-SSH "docker logs nestjs-api --tail 10 2>&1"

Write-Host "`n=== 6. Test /health ==="
Run-SSH "curl -s http://localhost:3000/health"
Run-SSH "curl -s -o /dev/null -w 'HTTPS_TO_BACKEND:%{http_code}' https://thanhhaidev.me/health"
