# AI园林助手 - 7天开发任务清单

---

## Day 1：基础设施完善

1. 完善 `request.ts`：添加请求拦截器（token注入、Accept-Language头、请求日志）
2. 完善 `request.ts`：添加响应拦截器（code判断、statusCode分类处理、错误提示）
3. 完善 `store/index.ts`：新增 language、identifyHistory、diagnoseHistory、favorites 状态
4. 完善 `types/index.ts`：新增 IdentifyRecord、DiagnoseRecord、CommunityPost、WeatherInfo、GrowthRecord、AIAdvice 类型
5. 统一全局 SCSS 变量（深绿色主色系、圆角、阴影、间距）和 mixin（flex-center、ellipsis、safe-area）
6. 修复 `useTranslation.ts`：改为静态导入 json，修复 Taro 引用，切换语言静默处理
7. 创建 `LanguageSwitch` 语言切换组件（中文/English 高亮切换）
8. 完善 `storage.ts`：新增 getJson、setJson、appendArray 方法
9. 配置 ESLint + Prettier 规则，创建 `.prettierrc`
10. 修改 `app.config.ts`：导航栏改为深绿色，预注册 encyclopedia/community/plant-detail 页面
11. 创建 `Modal` 通用弹窗组件（遮罩+卡片+确认/取消按钮）
12. 创建 `Tag` 标签组件（default/success/warning/danger 四种颜色）
13. 创建空页面文件：encyclopedia、community、plant-detail（各含 index.tsx + index.scss）
14. 验证 H5 和小程序构建通过

---

## Day 2：首页 + 植物识别

1. 首页接入 i18n：替换所有硬编码文案为 `t()` 调用
2. 首页集成 SearchBar：防抖搜索，跳转百科页带 keyword 参数
3. 首页快捷操作入口：4个按钮（识别/诊断/花园/百科）跳转对应页面
4. 首页每日小贴士：调用 getDailyTip API，失败用 mock 兜底
5. 首页热门植物推荐：调用 getHotPlants API，横向滚动列表，点击跳详情
6. 识别页接入 i18n：替换所有硬编码文案
7. 识别页集成 ImageUploader 组件替换原有上传区域
8. 识别页实现识别请求流程：调用 identifyPlant API，失败用 mock 兜底
9. 识别结果展示完善：名称+置信度进度条+科属+描述+养护要点图标列表
10. 识别页"添加到花园"：调用 addGardenPlant，成功后跳转花园页
11. 识别历史记录：调用 addIdentifyHistory，下方显示最近5条，点击可回顾
12. 识别页空状态/失败/加载处理：Empty 组件 + 重试按钮
13. 识别页样式优化：圆形上传区域、结果卡片、养护要点浅色背景
14. 首页与识别页联调：首页→识别→添加→花园全链路验证

---

## Day 3：花园 + 养护日历

1. 花园页接入 i18n + 状态管理：数据源改为 state.gardenPlants
2. 植物列表卡片完善：圆形图片+名称+Tag健康标签+浇水时间+浇水/详情按钮
3. 植物健康状态动态计算：根据 nextWaterTime 判断 healthy/warning/danger
4. 浇水功能：调用 updateGardenPlant 更新时间，Toast 提示成功
5. 植物详情弹窗：Modal 展示图片+基本信息+养护信息+浇水/删除/关闭按钮
6. 删除植物：确认弹窗 → removeGardenPlant → Toast 提示
7. 花园空状态：无植物时 Empty 组件引导去识别
8. 创建 Calendar 日历组件：月视图、任务标记、今天高亮、日期点击回调
9. 花园页日历标签页：集成 Calendar 组件，任务数据来自 gardenPlants
10. 今日养护任务列表：筛选今日浇水植物，显示任务项+完成按钮
11. 养护任务本地缓存：store 新增 careRecords，浇水时创建记录并持久化
12. 数据联动验证：识别→花园、浇水→日历、删除→日历 全局同步

---

## Day 4：诊断 + AI顾问

1. 诊断页接入 i18n：替换所有硬编码文案
2. 诊断页集成 ImageUploader + 调用 diagnosePlant API，失败用 mock 兜底
3. 诊断结果展示：病害名+Tag类型+置信度+症状+原因+处理方案步骤列表+预防措施
4. 诊断历史记录：调用 addDiagnoseHistory，下方显示最近5条，点击可回顾
5. 创建 AdviceCard 组件：图标+标题+优先级标签+内容+查看详情/忽略按钮+未读红点
6. 首页新增 AI 建议模块：从 gardenPlants 生成浇水建议，使用 AdviceCard 渲染
7. 花园页新增"AI建议"标签：分类筛选（全部/浇水/施肥/修剪），AdviceCard 列表
8. 建议已读/忽略功能：store 新增 advices 状态，markAdviceRead/ignoreAdvice 方法
9. 诊断结果"加入养护计划"按钮：创建 CareRecord，Toast 提示
10. 诊断页加载/失败/空状态处理
11. 诊断页样式优化：步骤序号圆圈、预防措施浅绿色卡片

---

## Day 5：百科 + 社区 + 个人中心

1. 百科页面开发：SearchBar+分类筛选+网格列表+分页加载+点击跳详情
2. 百科页接入 i18n：创建 encyclopedia.json 中英文翻译
3. 植物详情页开发：大图+名称+科属+描述+养护要点+特性标签+加入花园/收藏按钮
4. 社区页面开发：动态列表+发布弹窗（文字+图片）+点赞功能
5. 社区页接入 i18n：创建 community.json 中英文翻译
6. 个人中心接入 i18n：替换所有硬编码文案
7. 个人中心用户信息展示：头像+昵称+等级，从 state.user 读取
8. 个人中心统计数据：植物数/识别数/诊断数，从 state 动态计算
9. 个人中心菜单列表：收藏/识别历史/诊断历史/养护提醒/百科/语言设置/关于/设置
10. 语言切换功能：点击弹出 Modal 含 LanguageSwitch，切换后全页面更新
11. 收藏夹功能：从 state.favorites 获取，百科页支持 tab=favorites 参数
12. 识别历史展示：个人中心内展开列表，缩略图+植物名+时间，点击回顾
13. 诊断历史展示：个人中心内展开列表，缩略图+病害名+时间，点击回顾
14. 个人中心样式优化：深绿色头部+白色统计卡片+菜单列表

---

## Day 6：UI优化 + 高级功能

1. 统一深绿色主题：所有 SCSS 硬编码颜色替换为全局变量，TabBar selectedColor 改为 #2D5A4A
2. 页面进入动画：app.scss 定义 fade-in-up 动画，各页面根容器添加动画类
3. 按钮交互反馈：Button 组件添加 :active 缩放效果和 transition
4. 天气联动功能：创建 weather API+mock，首页新增天气卡片（城市/温度/湿度/建议）
5. 成长记录功能：植物详情弹窗新增成长标签，拍照记录按时间线展示
6. 季节指南模块：首页新增当季养护建议卡片，根据月份判断季节
7. 养护统计图表：个人中心新增 CSS 柱状图，本周浇水次数可视化
8. 图片懒加载：长列表图片使用 lazyLoad，加载前显示占位灰色背景
9. 空状态/加载状态统一：所有列表页面统一使用 Empty 和 Loading 组件
10. 本地缓存策略完善：storage 新增 setWithExpiry/getWithExpiry，热门植物和天气带过期时间

---

## Day 7：测试 + 构建 + 上线

1. H5端全功能测试：7个页面逐页验证所有功能
2. 微信小程序端测试：重点测试 chooseImage、navigateTo/switchTab、Storage 兼容性
3. 中英文切换全测试：逐页检查是否有遗漏的硬编码中文
4. 全流程测试：识别流程、诊断流程、养护流程、百科流程、社区流程
5. 边界情况测试：空数据、网络错误、大量数据、重复点击、图片加载失败
6. 修复所有测试发现的 Bug
7. ESLint 全量检查：修复所有 error，`npx eslint src/ --ext .ts,.tsx`
8. TypeScript 类型检查：`npx tsc --noEmit`，修复所有类型错误
9. 代码格式统一：`npx prettier --write "src/**/*.{ts,tsx,scss}"`
10. 移除无用代码：未使用 import、变量、注释代码、多余 mock 数据
11. H5 生产构建：`npm run build:h5`，检查产物体积
12. 微信小程序构建：`npm run build:weapp`，开发者工具验证，Git 提交打 Tag

---

## 团队分工建议

| 成员 | Day 1-3 | Day 4-5 | Day 6-7 |
|------|---------|---------|---------|
| 前端A | 基础设施、首页、识别 | 诊断、AI顾问 | UI优化、测试 |
| 前端B | 状态管理、花园、日历 | 百科、社区、个人中心 | 高级功能、构建 |
| 前端C | 组件开发 | 样式优化 | Bug修复、文档 |