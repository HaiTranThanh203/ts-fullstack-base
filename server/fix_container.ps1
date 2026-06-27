$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_fix.txt"
$errPath = "$env:TEMP\ssh_fix_err.txt"

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

Write-Host "=== 1. Xoa container cu hoan toan ==="
Run-SSH "docker rm -f 758a77987441_nestjs-api 2>/dev/null || true"
Run-SSH "docker rm -f nestjs-api 2>/dev/null || true"
Run-SSH "docker ps -a --filter name=nestjs --format '{{.Names}} {{.Status}}'"

Write-Host "`n=== 2. Xoa image cu ==="
Run-SSH "docker rmi nestjs-api:latest --no-prune 2>/dev/null || true"

Write-Host "`n=== 3. Rebuild image ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose build 2>&1 | tail -5"

Write-Host "`n=== 4. Up container moi ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose up -d 2>&1"

Write-Host "`n=== 5. Kiem tra ==="
Run-SSH "sleep 25 && docker ps --format 'table {{.Names}}\t{{.Status}}'"

Write-Host "`n=== 6. Logs ==="
Run-SSH "docker logs nestjs-api --tail 10 2>&1"

Write-Host "`n=== 7. Test /health ==="
Run-SSH "curl -s https://thanhhaidev.me/health"
