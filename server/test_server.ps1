$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_test.txt"
$errPath = "$env:TEMP\ssh_test_err.txt"

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

Write-Host "=== 1. Kiểm tra container có đang chạy không ==="
Run-SSH "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

Write-Host "`n=== 2. Test endpoint /health (public, không cần token) ==="
Run-SSH "curl -s https://thanhhaidev.me/health"

Write-Host "`n=== 3. Test endpoint / (root) ==="
Run-SSH "curl -s -o /dev/null -w 'HTTP:%{http_code}' https://thanhhaidev.me/"

Write-Host "`n=== 4. Test endpoint /users (cần token - sẽ trả 401) ==="
Run-SSH "curl -s https://thanhhaidev.me/users"
