$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_final.txt"
$errPath = "$env:TEMP\ssh_final_err.txt"

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

Write-Host "=== Test /health qua HTTPS ==="
Run-SSH "curl -s https://thanhhaidev.me/health"

Write-Host "`n=== Test / (root) ==="
Run-SSH "curl -s -o /dev/null -w 'HTTP:%{http_code}' https://thanhhaidev.me/"

Write-Host "`n=== Container status ==="
Run-SSH "docker ps --format 'table {{.Names}}\t{{.Status}}'"
