$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_where.txt"
$errPath = "$env:TEMP\ssh_where_err.txt"

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

Write-Host "=== Check app.controller.ts on VPS ==="
Run-SSH "grep -n 'health' /app/nestjs-crud/ts-fullstack-base/server/src/app.controller.ts"

Write-Host "`n=== Check all server directories ==="
Run-SSH "ls -la /app/nestjs-crud/"
Run-SSH "find /app/nestjs-crud -name 'app.controller.ts' 2>/dev/null"

Write-Host "`n=== Check what code is actually in the Docker image ==="
Run-SSH "docker run --rm nestjs-api:latest cat /app/dist/app.controller.js 2>&1 | grep -i health || echo 'NOT FOUND'"
