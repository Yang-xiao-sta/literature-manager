@echo off
chcp 65001 >nul
title 文献管理系统 - 公网服务(生产模式)

echo ============================================
echo   文献记录与总结管理网站 - 公网服务
echo   生产模式 - URL 更稳定
echo ============================================
echo.

cd /d "E:\CODE\软件\literature-records-manager"

echo [1/2] 正在启动 Next.js 生产服务器...
start "文献管理-Prod" cmd /c "npx next start -p 3000"
echo.

echo [2/2] 等待服务器就绪（10秒）...
timeout /t 10 /nobreak >nul

echo 正在创建公网隧道...
echo.
echo ============================================
echo  你的公网访问地址：
echo.
npx --yes localtunnel --port 3000 --subdomain literature-manager
echo.
echo ============================================
echo 如果上方显示了 your url is: https://literature-manager.loca.lt
echo 则该地址可长期使用！
echo.
echo 隧道断开后按任意键退出...
pause >nul
