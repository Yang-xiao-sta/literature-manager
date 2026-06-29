# 文献记录与总结管理网站

面向科研工作的文献管理工具，支持文件夹树管理、表格化记录、AI 自动总结、一键整理分类。

## 技术栈

- Next.js 16 + TypeScript
- Tailwind CSS 4
- Prisma + SQLite（本地）/ Turso（云端）
- DeepSeek API（AI 功能）
- React Hook Form + Zod
- TanStack Table

## 快速开始

```bash
npm install
cp .env.example .env   # 编辑 .env 填入配置
npm run db:init         # 初始化数据库结构
npx prisma db seed      # 可选：导入示例数据
npm run dev             # 打开 http://localhost:3000
```

## 环境变量

```env
# 本地 SQLite（默认）
DATABASE_URL="file:./dev.db"

# 远程 Turso（云端部署）
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN=your-token

# AI 功能（可选）
DEEPSEEK_API_KEY=sk-...
```

## 主要功能

- 📁 树状文件夹管理（无限层级）
- 📋 文献表格（搜索、筛选、排序）
- 📄 文献详情页（详细总结 + 图表记录）
- ✨ AI 自动总结（DeepSeek 分析摘要填充 10 个字段）
- 📊 一键整理（AI 自动分类文献到对应文件夹）
- 🔍 智能导入（DOI / 标题 / URL 自动获取文献信息）
- 📥 CSV 导入导出

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入仓库
3. 设置环境变量 `TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`DEEPSEEK_API_KEY`
4. 自动部署完成
