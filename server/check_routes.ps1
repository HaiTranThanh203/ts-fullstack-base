$password = 'hainoPro2612nha'
$env:SSH_ASKPASS = "$env:TEMP\askpass.bat"
$env:SSH_ASKPASS_REQUIRE = 'force'
$env:DISPLAY = ':0'
Set-Content "$env:TEMP\askpass.bat" -Value "@echo off`necho $password" -Encoding ASCII

$outPath = "$env:TEMP\ssh_rr.txt"
$errPath = "$env:TEMP\ssh_rr_err.txt"

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

Write-Host "=== Check AppModule - does it import AppController? ==="
Run-SSH "grep -n 'AppController\|controllers' /app/nestjs-crud/ts-fullstack-base/server/src/app.module.ts"

Write-Host "`n=== Check PresentationModule - what's in it? ==="
Run-SSH "cat /app/nestjs-crud/ts-fullstack-base/server/src/presentation/presentation.module.ts 2>/dev/null || echo 'FILE NOT FOUND'"

Write-Host "`n=== Check all controller files ==="
Run-SSH "find /app/nestjs-crud/ts-fullstack-base/server/src -name '*.controller.ts' 2>/dev/null"

Write-Host "`n=== Check main.js imports ==="
Run-SSH "docker run --rm nestjs-api:latest cat /app/dist/app.module.js 2>&1 | head -30"

Write-Host "`n=== Check if PresentationModule is in app.module ==="
Run-SSH "docker run --rm nestjs-api:latest cat /app/dist/app.module.js 2>&1 | grep -i 'presentation\|AppController\|app.controller'"
