# 文献记录与总结管理网站

一个面向科研工作的本地运行 MVP，用于管理文献分类、表格化记录、详细总结、图表摘录和基础检索。

## 技术栈

- Next.js 16 + TypeScript
- Tailwind CSS 4
- Prisma + SQLite
- React Hook Form + Zod
- TanStack Table
- Sonner Toast
- Papa Parse CSV

## 已实现功能

- 左侧树状文件夹管理
- 新建、重命名、删除文件夹
- 右侧文献表格展示
- 文献新增、编辑、删除
- 标题 / 作者 / 期刊 / 标签搜索
- 按阅读状态、标签筛选
- 按更新时间、年份、影响因子、重要程度排序
- 文献详细总结页 `/papers/[id]`
- 图表记录维护
- 当前文件夹 CSV 导出
- CSV 导入到当前文件夹
- Prisma seed 示例数据

## 示例数据

初始化后会自动写入：

- 3 个一级文件夹
- 每个一级文件夹 1-2 个子文件夹
- 8 篇示例文献
- 3 篇带详细总结的文献
- 3 条图表记录

## 安装依赖

```bash
npm install
```

Windows PowerShell 如果受到脚本策略影响，建议使用：

```bash
cmd /c npm install
```

## 环境变量

复制 `.env.example` 为 `.env`，默认内容如下：

```env
DATABASE_URL="file:./dev.db"
```

## 数据库初始化

1. 生成 Prisma Client

```bash
npm run prisma:generate
```

2. 生成本地数据库结构

优先使用下面这条命令，适合当前本机环境：

```bash
npm run db:init
```

3. 可选：如果你的环境里 Prisma migrate 可正常运行，也可以执行迁移

```bash
npm run prisma:migrate -- --name init
```

4. 写入 seed 数据

```bash
npm run prisma:seed
```

## 启动开发环境

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

## 质量检查

```bash
npm run lint
npm run typecheck
```

## 主要页面

- `/`
  左侧为文件夹树，右侧为当前文件夹文献表格。

- `/papers/[id]`
  查看并编辑单篇文献的详细总结、图表记录和基础信息。

## CSV 导入导出说明

- 导出：导出当前文件夹下的文献为 CSV
- 导入：支持从 `.csv` 文件读取或直接粘贴 CSV 内容
- 当前固定字段：
  `title, authors, journal, year, impactFactor, doi, sourceUrl, pdfUrl, tags, mainConclusion, methods, status, rating, notes`

## 后续可扩展方向

- 本地文件上传与对象存储抽象
- 关联文献可视化
- 多用户与权限
- Markdown 编辑器增强
- 全文 PDF 解析和自动摘要
- PostgreSQL 切换
- 批量操作与更强的 Excel-like 编辑体验

## 关于数据库初始化

当前项目保留了 Prisma schema、Prisma Client 和 seed。

在这台机器上，`prisma migrate dev` 的 schema engine 存在环境兼容问题，因此额外提供了 `npm run db:init` 作为稳定初始化路径。

这不会影响应用运行、Prisma Client 查询和后续继续迁移到 PostgreSQL 的数据模型设计。
