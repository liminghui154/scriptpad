# ScriptPad

[English](#english) | [中文](#中文)

---

## English

A lightweight desktop tool for managing, organizing, and executing scripts. Built with Tauri v2 + React + TypeScript.

Developers often have scripts scattered across different directories — hard to find, hard to remember parameters, hard to run quickly. ScriptPad brings them all together in one place.

### Features

- **Script Management** — Import existing script files or create inline scripts directly
- **Category Organization** — Built-in categories (Deploy, Build, Clean, Tools) + custom categories
- **Search** — Quickly find scripts by name
- **Parameterized Execution** — Define parameter templates, fill in values before running, save presets
- **Real-time Output** — Stream stdout/stderr live as scripts execute
- **Execution History** — Track past runs with exit codes, duration, and output
- **Script Preview** — View script content with adjustable font size
- **Resizable Layout** — Three-panel layout with drag-to-resize handles
- **Cross-platform** — macOS, Windows, Linux

### Screenshots

<!-- Add screenshots here -->

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Tauri v2 + Rust |
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | SQLite (rusqlite) |
| Build | Vite |

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.77
- Platform-specific dependencies for Tauri: [see Tauri docs](https://v2.tauri.app/start/prerequisites/)

### Getting Started

```bash
# Clone the repo
git clone https://github.com/liminghui154/scriptpad.git
cd scriptpad

# Install frontend dependencies
npm install

# Run in development mode
npx tauri dev

# Build for production
npx tauri build
```

### Project Structure

```
scriptpad/
├── src/                        # React frontend
│   ├── components/
│   │   ├── sidebar/            # Category nav + script list
│   │   ├── detail/             # Script detail, params, form
│   │   └── output/             # Output panel + history
│   ├── hooks/                  # useScripts, useCategories, useExecution
│   ├── lib/                    # API wrappers, types, utils
│   └── App.tsx                 # Main layout
├── src-tauri/                  # Rust backend
│   ├── src/commands/           # Tauri command handlers
│   ├── migrations/             # SQLite schema
│   └── tauri.conf.json         # App config
└── package.json
```

### License

MIT

---

## 中文

一个轻量级桌面工具，用于统一管理、分类和执行脚本。基于 Tauri v2 + React + TypeScript 构建。

开发者日常有大量散落各处的脚本——找不到、记不住参数、无法快速执行。ScriptPad 将它们集中在一个地方统一管理。

### 功能特性

- **脚本管理** — 导入已有脚本文件，或直接创建内联脚本
- **分类管理** — 内置分类（部署、构建、清理、工具）+ 自定义分类
- **搜索** — 按名称快速查找脚本
- **参数化执行** — 定义参数模板，运行前填写参数值，支持保存预设
- **实时输出** — 脚本执行时实时流式显示 stdout/stderr
- **执行历史** — 记录每次执行的退出码、耗时和输出
- **脚本预览** — 查看脚本内容，支持字体大小调节
- **可调布局** — 三栏布局，支持拖拽调整宽度
- **跨平台** — 支持 macOS、Windows、Linux

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Tauri v2 + Rust |
| 前端 | React 19 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 图标 | Lucide React |
| 数据库 | SQLite (rusqlite) |
| 构建 | Vite |

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Rust](https://www.rust-lang.org/tools/install) >= 1.77
- Tauri 平台依赖：[参考 Tauri 文档](https://v2.tauri.app/start/prerequisites/)

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/liminghui154/scriptpad.git
cd scriptpad

# 安装前端依赖
npm install

# 开发模式运行
npx tauri dev

# 构建生产版本
npx tauri build
```

### 许可证

MIT
