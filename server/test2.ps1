$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_t.txt"
$errPath = "$env:TEMP\ssh_t_err.txt"

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

Write-Host "=== Test /health ==="
Run-SSH "curl -s http://localhost:3000/health"
Write-Host "---"

Write-Host "`n=== Test / (should return hello) ==="
Run-SSH "curl -s http://localhost:3000/"
Write-Host "---"

Write-Host "`n=== Full verbose test ==="
Run-SSH "curl -v http://localhost:3000/health 2>&1 | head -20"

Write-Host "`n=== Check routes in container ==="
Run-SSH "docker run --rm nestjs-api:latest cat /app/dist/main.js 2>&1 | grep -i 'listen\|port\|health' | head -10"
