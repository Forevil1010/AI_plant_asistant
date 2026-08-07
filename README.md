# AI 园林助手

AI 园林助手是一款面向普通植物爱好者和养护新手的免费工具，以微信小程序为主要使用入口，帮助用户认识植物、初步判断植物问题，并持续管理自己的植物和养护任务。

当前仓库已经完成一版可运行的本地 MVP。项目采用 Taro + React + TypeScript，可构建为微信小程序和 H5；已实现火山方舟 Doubao-Seed-2.0-Mini 视觉多模态适配器，配置有效密钥和后端地址后可完成真实 AI 识别与诊断，个人数据保存在当前设备。仓库同时提供可在本地启动的 Express 后端服务，AI 调用失败时自动回退到 Mock 数据。

## 当前功能

| 模块 | 已实现能力 |
| --- | --- |
| 首页 | 本地植物搜索、识别/诊断/花园入口、今日与逾期任务、每日提示、可进入知识详情的常见植物推荐 |
| 植物识别 | 拍照或选择图片、火山方舟 AI 识别（Mock 自动回退）、结果来源与可信度、低可信度 Top 3 候选、六项养护建议、加入花园、识别历史 |
| 植物诊断 | 图片和文字可单独或组合提交、火山方舟 AI 诊断（Mock 自动回退）、结果来源、处理步骤、关联花园植物、诊断历史、根据诊断创建养护任务 |
| 我的花园 | 手动添加、识别后添加、编辑和删除植物档案，删除时级联清理关联数据 |
| 养护记录 | 快捷记录浇水、施肥、修剪、换盆、用药和观察，查看与删除时间线记录 |
| 养护任务 | 创建一次性或日/周/月重复任务，查看待办和逾期状态，完成、跳过、延后或删除任务 |
| 个人中心 | 基于本地真实数据展示统计，查看两类历史，查看隐私说明，清除全部本地数据 |
| 数据能力 | React Context 全局状态、Taro Storage 本地持久化、最多保留 50 条识别和诊断历史 |

## 当前边界

- 植物识别和问题诊断已实现火山方舟 Doubao-Seed-2.0-Mini 适配器、超时、响应校验和 Mock 回退；真实密钥联调、HTTPS 部署及微信真机验证仍需完成。AI 结果仅供参考，不能替代专业检测。
- 尚无已部署的 CloudBase 或其他数据后端，不支持登录、云同步和多设备共享；仓库中的 `server/` 是本地 Express 服务，已接入火山方舟 AI。
- 已能创建并在应用内查看养护任务；微信订阅消息已明确暂缓，不作为当前版本验收阻塞项。
- 当前内置知识库只包含少量演示植物，不是完整植物百科。
- 首页搜索结果和下方常见植物卡片均可进入知识详情；已加入花园的搜索结果会进入对应养护详情。
- 正式小程序 AppID、基本信息、类目和微信认证已完成配置，备案已提交并处于管局审核中；微信开发者工具调试已通过，体验版真机全流程和发布验收仍待完成。
- 项目完全免费，首版不包含支付、会员、广告、社区、专家问诊或内容运营后台。

这些未完成能力按功能价值和外部条件推进，不再使用 48 小时或七天逐日排期。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 跨端框架 | Taro 4.2.1 |
| 界面层 | React 18.3.1 |
| 开发语言 | TypeScript 5，严格模式 |
| 构建工具 | Webpack 5 |
| 样式 | SCSS |
| 状态管理 | React Context + Reducer |
| 本地存储 | Taro Storage |
| 测试与检查 | Jest（22 个前端测试、22 个后端测试）、ESLint、TypeScript |
| 自动检查 | GitHub Actions |
| 可选后端 | Node.js 22、Express，已接入火山方舟 Doubao-Seed-2.0-Mini |

## 本地开发

### 需要准备

- Node.js：建议使用 22 LTS。
- npm：随 Node.js 安装。
- 浏览器：用于 H5 调试。
- 微信开发者工具：用于微信小程序预览和真机调试。
- 微信小程序 AppID：只做本地界面体验时可暂用测试号；预览、真机调试、订阅消息和发布时需要已注册的小程序及相应权限。

默认 Mock 模式不需要 CloudBase、数据库、AI 密钥或单独启动后端服务。需要验证本地 Express 接口或联调真实 AI 时，再安装并启动 `server/`。

### 安装依赖

```bash
npm install
npm install --prefix server
```

### H5 开发

```bash
npm run dev:h5
```

命令会持续编译 H5 到 `dist/`，但该脚本本身不保证启动可访问的网页服务器。需要浏览器联调时，应再用本地静态服务器托管 `dist/`，并以静态服务器输出的 URL 为准。

### 微信小程序开发

```bash
npm run dev:weapp
```

然后在微信开发者工具中导入仓库根目录。`project.config.json` 已将小程序目录指向 `dist/`，开发命令需在调试期间保持运行。组长已取得正式 AppID 并在本地配置；团队成员应使用自己的开发者权限和不提交的私有配置，严禁把真实 AppID、AppSecret 或其他密钥提交到仓库。

### AI 模式配置

项目已接入火山方舟 Doubao-Seed-2.0-Mini 视觉多模态模型。配置步骤：

1. **后端配置**：复制 `server/.env.example` 为 `server/.env`，填入火山方舟 API Key：

```env
ARK_API_KEY=ark-xxxxxxxxx-xxxxx
ARK_MODEL=doubao-seed-2-0-mini-260428
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_TIMEOUT_MS=25000
```

2. **前端配置**：复制根目录 `.env.example` 为 `.env`，本地联调时明确改为：

```env
TARO_APP_API_BASE_URL=http://localhost:3000/api
TARO_APP_USE_MOCK=false
```

未配置后端地址时必须保持 `TARO_APP_USE_MOCK=true`；启用真实 AI 但缺少地址时，构建会直接报错。

3. **启动并检查后端**：

```bash
npm run dev --prefix server
```

访问 `http://localhost:3000/api/health`，确认 `aiMode` 为 `ark` 且 `hasAiProvider` 为 `true`。健康检查不会返回密钥。

4. **启动前端**：

```bash
npm run dev:h5
```

配置完成后，植物识别和病虫害诊断将调用真实 AI。未配置有效 `ARK_API_KEY` 时返回 Mock 数据；AI 超时、HTTP 错误或结构异常时会自动回退并在页面标记来源。微信真机必须使用已部署的 HTTPS 地址，不能使用 `localhost`，还要在微信公众平台配置 request 合法域名。当前后端尚未实现微信身份鉴权，只适合本地或受控体验联调；正式公网发布前必须补齐鉴权和费用保护。

### 构建与质量检查

```bash
npm run check
npm run build:h5
npm run build:weapp
```

`npm run check` 会依次执行 TypeScript、ESLint、前端 Jest 和后端 Node 测试。推送到 `main` 或创建 Pull Request 时，GitHub Actions 会分别安装前后端依赖、执行这些检查，并完成 H5 与微信小程序生产构建。两个 `dist/` 构建结果会分别作为 `h5-dist` 和 `weapp-dist` 保存 7 天，便于下载验收。

当前本地 MVP 的 CI 不需要 GitHub Secrets。未来接入后端部署或第三方服务时，应通过仓库的 `Settings -> Secrets and variables -> Actions` 配置密钥；微信 AppSecret、AI API 密钥等敏感信息不得提交到代码仓库或打包进前端产物。

## 页面结构

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/pages/home/index` | 搜索、入口、任务和推荐 |
| 植物识别 | `/pages/identify/index` | 图片输入、真实 AI/Mock 识别和结果 |
| 我的花园 | `/pages/garden/index` | 植物列表和养护任务 |
| 植物诊断 | `/pages/diagnose/index` | 图文输入、真实 AI/Mock 诊断和建议 |
| 个人中心 | `/pages/profile/index` | 数据概览、历史和设置 |
| 植物表单 | `/pages/plant-form/index` | 新建或编辑植物档案 |
| 植物详情 | `/pages/plant-detail/index` | 养护记录、任务和品种参考 |
| 植物知识详情 | `/pages/plant-knowledge/index` | 内置植物资料、六项养护建议和加入花园 |
| 任务表单 | `/pages/task-form/index` | 创建养护任务和重复规则 |
| 历史记录 | `/pages/history/index` | 识别与诊断历史 |

## 目录说明

```text
config/                 Taro 构建配置
docs/                   产品需求与 MVP 范围
server/                 厂商无关的 Express 接口骨架、接口保护和后端测试
src/
  assets/               演示图片及许可说明
  components/           通用界面组件
  data/                 本地植物知识数据
  pages/                页面实现
  services/             可替换的 Mock AI 服务
  store/                全局状态与本地持久化
  types/                业务类型
  utils/                日期和展示工具
tests/                  单元测试
```

## 后续功能方向

1. 等待备案审核结果，上传体验版并完成拍照、相册、路由、本地存储和核心业务的真机验收。
2. 让首页搜索结果可以进入与常见植物卡片相同的知识详情页，并处理真机测试发现的问题。
3. 部署后端到 HTTPS 环境，配置微信合法域名，让真机也能使用 AI 识别与诊断。
4. 微信订阅消息保持暂缓；后续重新启动时再设计云端任务、定时调度和消息发送。

功能优先级和验收边界见 [MVP 范围与迭代规划](docs/MVP_SCOPE.md)，完整产品要求见 [产品需求文档](docs/PRD.md)。演示图片来源见 [图片许可说明](src/assets/ATTRIBUTION.md)。
