$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_hc3.txt"
$errPath = "$env:TEMP\ssh_hc3_err.txt"

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

Write-Host "=== Remove old image and rebuild cleanly ==="
Run-SSH "docker rmi nestjs-api:latest --force 2>/dev/null || true"
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose build --no-cache 2>&1 | tail -15"

Write-Host "`n=== Start container ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose up -d 2>&1 | tail -5"

Write-Host "`n=== Wait for startup ==="
Run-SSH "sleep 25 && docker ps --format 'table {{.Names}}\t{{.Status}}'"
Run-SSH "docker logs nestjs-api --tail 15 2>&1"

Write-Host "`n=== Test health endpoint ==="
Run-SSH "curl -s https://thanhhaidev.me/health"
