@echo off
chcp 65001 >nul
title 文献管理系统 - 公网服务
color 0A

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║     文献记录与总结管理网站 - 公网服务           ║
echo  ╚══════════════════════════════════════════════════╝
echo.

cd /d "E:\CODE\软件\literature-records-manager"

:: ========== 1. 启动 Next.js ==========
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] Node.js 服务已在运行，跳过启动
) else (
    echo [1/2] 启动 Next.js 开发服务器...
    start "文献管理-NextJS" /MIN cmd /c "npm run dev"
    echo       等待服务器就绪（15秒）...
    timeout /t 15 /nobreak >nul
    echo [OK] 服务器已启动
)
echo.

:: ========== 2. 启动隧道 ==========
echo [2/2] 创建公网隧道...
echo.
echo       ┌─────────────────────────────────────────────┐
echo       │  下方会显示一个 https://xxxx.loca.lt 地址  │
echo       │  复制该地址即可在任何设备上打开网站！       │
echo       │  关闭本窗口 = 停止服务                      │
echo       └─────────────────────────────────────────────┘
echo.

npx --yes localtunnel --port 3000

echo.
echo       ═══════════════════════════════════════════════
echo       隧道已断开，按任意键关闭窗口...
pause >nul
