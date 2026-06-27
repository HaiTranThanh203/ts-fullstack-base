$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_hccheck.txt"
$errPath = "$env:TEMP\ssh_hccheck_err.txt"

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

Write-Host "=== Check app.controller.ts tren VPS ==="
Run-SSH "grep -n 'health\|Health\|GetHealth' /app/nestjs-crud/ts-fullstack-base/server/src/app.controller.ts"

Write-Host "`n=== Check git log tren VPS ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base && git log --oneline -5"

Write-Host "`n=== Check git log tren local ==="
Set-Location 'C:\Users\admin\Code\hoidanit'
git log --oneline -5

Write-Host "`n=== Build lai tren VPS ==="
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose build --no-cache 2>&1 | tail -5"
Run-SSH "cd /app/nestjs-crud/ts-fullstack-base/server && docker-compose up -d 2>&1"
Run-SSH "sleep 25 && docker logs nestjs-api --tail 15 2>&1"
Run-SSH "curl -s https://thanhhaidev.me/health"
