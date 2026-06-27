$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_hc2.txt"
$errPath = "$env:TEMP\ssh_hc2_err.txt"

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

Write-Host "=== Discard local Dockerfile change and pull ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base && git checkout -- server/Dockerfile"
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base && git pull origin main 2>&1"

Write-Host "`n=== Rebuild Docker container ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose up -d --build 2>&1 | tail -10"

Write-Host "`n=== Wait for startup ==="
Run-SSH "sleep 25 && docker ps --format 'table {{.Names}}\t{{.Status}}'"
Run-SSH "docker logs nestjs-api --tail 15 2>&1"

Write-Host "`n=== Test health endpoint ==="
Run-SSH "curl -s https://thanhhaidev.me/health"
