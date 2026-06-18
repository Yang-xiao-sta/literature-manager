@echo off
chcp 65001 >nul
title 文献管理系统 - Cloudflare隧道
color 0B

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║  文献管理系统 - Cloudflare 隧道 (更稳定)        ║
echo  ╚══════════════════════════════════════════════════╝
echo.

cd /d "E:\CODE\软件\literature-records-manager"

:: 启动 Next.js
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Node.js 服务已在运行
) else (
    echo [1/3] 启动 Next.js...
    start "文献管理-NextJS" /MIN cmd /c "npm run dev"
    echo       等待就绪（15秒）...
    timeout /t 15 /nobreak >nul
)
echo.

:: 启动 Cloudflare 隧道（通过 WSL）
echo [2/3] 通过 WSL 启动 Cloudflare 隧道...
echo.
wsl bash -c "/tmp/cloudflared-linux-amd64 tunnel --url http://172.30.96.1:3000 2>&1 | grep -m1 'trycloudflare.com'"
echo.
echo [3/3] 如果上方显示 trycloudflare.com 地址，隧道已就绪！
echo.
echo       按 Ctrl+C 停止服务，或直接关闭窗口
echo       ═══════════════════════════════════════════════

:: 如果 cloudflared 不在 /tmp，提示安装
if not exist "\wsl$\Ubuntu-24.04\tmp\cloudflared-linux-amd64" (
    echo [警告] cloudflared 未找到，请使用 start-public.bat 代替
    pause
    exit /b 1
)

wsl bash -c "/tmp/cloudflared-linux-amd64 tunnel --url http://172.30.96.1:3000"

pause >nul
