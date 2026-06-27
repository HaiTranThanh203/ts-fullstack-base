$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_nc.txt"
$errPath = "$env:TEMP\ssh_nc_err.txt"

function Run-SSH {
    param($cmd)
    $proc = Start-Process -FilePath "C:\WINDOWS\System32\OpenSSH\ssh.exe" `
        -ArgumentList "-o","StrictHostKeyChecking=no","-o","ConnectTimeout=15","-o","PreferredAuthentications=password","-o","PubkeyAuthentication=no","-o","BatchMode=no","root@168.144.42.87",$cmd `
        -NoNewWindow -Wait -PassThru `
        -RedirectStandardOutput $outPath `
        -RedirectStandardError $errPath
    Write-Host "  $($proc.ExitCode) | $($stdout = Get-Content $outPath -Raw; if ($stdout) { $stdout.Trim() } else { '(empty)' })"
    return $proc.ExitCode
}

Write-Host "=== 1. Xoa image cu ==="
Run-SSH "docker rmi nestjs-api:latest 2>/dev/null || true"

Write-Host "`n=== 2. Build --no-cache ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose build --no-cache 2>&1 | tail -8"

Write-Host "`n=== 3. Remove old container ==="
Run-SSH "docker rm -f nestjs-api 2>/dev/null || true"

Write-Host "`n=== 4. Start new container ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker run -d --name nestjs-api --restart unless-stopped -p 3000:3000 --network server_nestjs_network --env-file .env nestjs-api:latest 2>&1"

Write-Host "`n=== 5. Kiem tra routes ==="
Run-SSH "sleep 20 && docker logs nestjs-api --tail 10 2>&1"

Write-Host "`n=== 6. Test /health ==="
Run-SSH "curl -s http://localhost:3000/health"
