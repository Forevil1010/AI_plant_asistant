# AI园林助手

> 智能植物识别与养护管理平台 | Smart Plant Identification & Care Management Platform

## 项目简介

AI园林助手是一款基于人工智能的植物养护管理应用，通过图像识别技术帮助用户快速识别植物种类，提供专业的养护建议，并支持花园管理、病虫害诊断、社区交流等功能。支持中英文双语界面。

AI Garden Assistant is an AI-powered plant care management application that helps users quickly identify plant species through image recognition, provides professional care advice, and supports garden management, disease diagnosis, community sharing, and more. Supports bilingual (Chinese/English) interface.

## 功能特性

### 🌿 核心功能 / Core Features

| 功能 | 中文描述 | English Description |
|------|----------|---------------------|
| **植物识别** | 拍照上传植物照片，AI自动识别植物种类 | Capture or upload plant photos for AI identification |
| **病虫害诊断** | 上传病株照片，智能分析病害类型及处理方案 | Upload diseased plant photos for AI diagnosis |
| **我的花园** | 管理个人植物收藏，记录养护日志 | Manage personal plant collection and care logs |
| **养护日历** | 智能提醒浇水、施肥、修剪等养护任务 | Smart reminders for watering, fertilizing, pruning |
| **植物百科** | 丰富的植物知识库，包含养护要点和特性 | Rich plant knowledge base with care tips |
| **双语支持** | 支持中英文切换，国际化界面 | Bilingual support (Chinese/English) |

### 💡 创新功能 / Innovative Features

| 功能 | 中文描述 | English Description |
|------|----------|---------------------|
| **AI园艺顾问** | 基于用户花园情况提供个性化养护建议 | Personalized care advice based on garden status |
| **社区交流** | 分享植物成长，交流养护经验 | Share plant growth, exchange care experience |
| **天气联动** | 结合天气预报智能调整养护计划 | Adjust care plan based on weather forecast |
| **成长记录** | 植物生长时间线，拍照记录变化 | Plant growth timeline with photo records |
| **季节指南** | 当季适宜种植与养护建议 | Seasonal planting and care recommendations |
| **植物搜索** | 按名称、分类、特性多维度搜索 | Multi-dimensional search by name, category, traits |

### 🚀 高级功能 / Advanced Features

| 功能 | 中文描述 | English Description |
|------|----------|---------------------|
| **多花园管理** | 支持创建多个花园空间分类管理 | Multiple garden spaces for categorized management |
| **养护统计** | 数据可视化展示养护习惯与植物健康 | Data visualization for care habits and plant health |
| **收藏夹** | 收藏喜爱的植物和文章 | Bookmark favorite plants and articles |
| **历史记录** | 识别与诊断历史快速回顾 | Quick review of identification and diagnosis history |
| **离线缓存** | 关键数据本地缓存，离线可用 | Local cache for key data, offline available |

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | Taro | 4.2.1 |
| 前端 | React | 18.2.0 |
| 语言 | TypeScript | 5.0.0 |
| 编译器 | Webpack | 5.x |
| 样式 | SCSS + CSS Modules | - |
| 国际化 | 自定义 i18n 方案 | - |
| 图标 | 自定义PNG图标 | - |

## 支持平台

- ✅ H5
- ✅ 微信小程序
- ✅ 支付宝小程序
- ✅ 百度小程序
- ✅ 抖音小程序

## 项目结构

```
AI-plant-asist/
├── config/                        # 项目配置
│   └── index.ts                   # Taro配置文件
├── scripts/                       # 脚本工具
│   └── make-icons.js              # TabBar图标生成脚本
├── src/                           # 源代码目录
│   ├── api/                       # API接口封装
│   │   ├── plant.ts               # 植物相关接口
│   │   ├── diagnose.ts            # 病虫害诊断接口
│   │   ├── garden.ts              # 花园管理接口
│   │   ├── user.ts                # 用户相关接口
│   │   └── article.ts             # 资讯文章接口
│   ├── components/                # 公共组件
│   │   ├── Button/                # 按钮组件
│   │   ├── Card/                  # 卡片组件
│   │   ├── Empty/                 # 空状态组件
│   │   ├── ImageUploader/         # 图片上传组件
│   │   ├── Loading/               # 加载组件
│   │   ├── SearchBar/             # 搜索框组件
│   │   └── index.ts               # 组件导出
│   ├── locales/                   # 国际化资源
│   │   ├── zh-CN/                 # 中文翻译
│   │   ├── en-US/                 # 英文翻译
│   │   ├── useTranslation.ts      # 翻译Hook
│   │   ├── I18nText.tsx           # 翻译组件
│   │   └── language.ts            # 语言管理
│   ├── pages/                     # 页面组件
│   │   ├── home/                  # 首页
│   │   ├── identify/              # 植物识别
│   │   ├── garden/                # 我的花园
│   │   ├── diagnose/              # 病虫害诊断
│   │   └── profile/               # 个人中心
│   ├── store/                     # 状态管理
│   │   └── index.ts               # React Context
│   ├── types/                     # 类型定义
│   │   └── index.ts               # 全局类型
│   ├── utils/                     # 工具函数
│   │   ├── request.ts             # HTTP请求封装
│   │   ├── storage.ts             # 本地存储封装
│   │   └── index.ts               # 通用工具
│   ├── images/                    # 图片资源
│   │   └── tab/                   # TabBar图标
│   ├── app.config.ts              # 应用配置（路由/TabBar）
│   ├── app.scss                   # 全局样式
│   ├── app.tsx                    # 应用入口
│   ├── index.html                 # H5入口HTML
│   └── main.tsx                   # React入口
├── babel.config.js                # Babel配置
├── tsconfig.json                  # TypeScript配置
└── package.json                   # 项目依赖
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# H5开发
npm run dev:h5

# 微信小程序开发
npm run dev:weapp
```

### 构建生产版本

```bash
# H5构建
npm run build:h5

# 微信小程序构建
npm run build:weapp
```

## 页面路由

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/pages/home/index` | 核心功能入口、快捷操作、资讯 |
| 植物识别 | `/pages/identify/index` | AI植物识别、历史记录 |
| 我的花园 | `/pages/garden/index` | 植物管理、养护日历 |
| 病虫害诊断 | `/pages/diagnose/index` | 病害诊断、处理方案 |
| 个人中心 | `/pages/profile/index` | 用户信息、设置、语言切换 |

## TabBar 配置

| 页面 | 图标 | 中文名称 | English Name |
|------|------|----------|--------------|
| 首页 | home | 首页 | Home |
| 植物识别 | identify | 识别 | ID |
| 我的花园 | garden | 花园 | Garden |
| 病虫害诊断 | diagnose | 诊断 | Diag |
| 个人中心 | profile | 我的 | Me |

## 开发文档

| 文档 | 说明 |
|------|------|
| [技术架构文档](TECHNICAL.md) | 系统架构、技术选型、模块设计 |
| [API接口文档](API.md) | 完整的API接口定义 |
| [数据库设计文档](DATABASE.md) | 数据库表结构设计 |
| [页面与组件设计文档](UI.md) | 页面结构、组件设计、交互规范 |
| [Sprint开发任务清单](SPRINT.md) | 7天每日开发任务计划 |

## 开发规范

### 命名规范
- 目录名：kebab-case（如 `plant-detail`）
- 文件名：kebab-case（如 `index.tsx`）
- 组件名：PascalCase（如 `PlantCard`）
- 变量名：camelCase（如 `plantList`）

### 代码规范
- 使用 TypeScript 严格模式
- 组件使用 React Hooks
- 样式使用 CSS Modules + SCSS
- 所有文案使用 i18n 翻译，不硬编码

## 许可证

MIT License