# AI园林助手 - 数据库设计文档

## 1. 数据库概述

### 1.1 数据库选择
- **数据库类型**: MySQL 8.0+
- **字符集**: UTF-8mb4（支持表情符号）
- **存储引擎**: InnoDB（支持事务、外键）

### 1.2 设计原则
- 采用范式设计，保证数据完整性
- 合理建立索引，优化查询性能
- 预留扩展字段，便于后续功能迭代
- 分离业务数据和日志数据

---

## 2. 实体关系图（ER图）

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│   user   │       │  garden_plant │       │   plant  │
├──────────┤       ├──────────────┤       ├──────────┤
│ id       │◄──────│ user_id      │       │ id       │
│ open_id  │       │ plant_id     │───────►│ name     │
│ nickname │       │ name         │       │ en_name  │
│ avatar   │       │ image_url    │       │ family   │
│ create_at│       │ position     │       │ genus    │
└──────────┘       │ water_interval│      │ origin   │
                   │ health_status │      │ desc     │
                   │ add_time      │      │ image_url│
                   │ last_water_at │     │ care_tips│
                   │ create_at     │      └──────────┘
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  care_record │
                   ├──────────────┤
                   │ id           │
                   │ plant_id     │
                   │ task_type    │
                   │ status       │
                   │ create_at    │
                   └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  identify    │       │   diagnose   │       │   article    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ user_id      │       │ user_id      │       │ title        │
│ plant_id     │       │ plant_name   │       │ content      │
│ image_url    │       │ image_url    │       │ summary      │
│ confidence   │       │ disease_name │       │ category     │
│ create_at    │       │ disease_type │       │ image_url    │
└──────────────┘       │ confidence   │       │ view_count   │
                       │ symptoms     │       │ publish_time │
                       │ treatment    │       │ create_at    │
                       │ preventive   │       └──────────────┘
                       │ create_at    │
                       └──────────────┘
```

---

## 3. 数据表设计

### 3.1 用户表（user）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 用户ID，UUID |
| open_id | VARCHAR | 64 | UNIQUE, NOT NULL | 小程序OpenID |
| nickname | VARCHAR | 50 | | 用户昵称 |
| avatar_url | VARCHAR | 255 | | 用户头像URL |
| plant_count | INT | | DEFAULT 0 | 花园植物数量 |
| identify_count | INT | | DEFAULT 0 | 识别次数 |
| diagnose_count | INT | | DEFAULT 0 | 诊断次数 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_at | DATETIME | | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_open_id` (open_id)
- `idx_create_at` (create_at)

---

### 3.2 植物百科表（plant）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 植物ID，UUID |
| name | VARCHAR | 50 | NOT NULL | 植物名称 |
| english_name | VARCHAR | 100 | | 英文名称 |
| family | VARCHAR | 50 | | 科名 |
| genus | VARCHAR | 50 | | 属名 |
| origin | VARCHAR | 100 | | 原产地 |
| description | TEXT | | | 植物描述 |
| care_tips | JSON | | | 养护要点JSON |
| features | JSON | | | 植物特性数组 |
| image_url | VARCHAR | 255 | | 植物图片URL |
| view_count | INT | | DEFAULT 0 | 查看次数 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_at | DATETIME | | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_name` (name)
- `idx_family` (family)
- `idx_view_count` (view_count)

**care_tips JSON结构**:
```json
{
  "water": "每周浇水2-3次",
  "light": "喜光，每天至少6小时光照",
  "temperature": "15-25℃",
  "fertilizer": "每月施一次复合肥"
}
```

---

### 3.3 花园植物表（garden_plant）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 记录ID，UUID |
| user_id | VARCHAR | 36 | FOREIGN KEY | 用户ID |
| plant_id | VARCHAR | 36 | FOREIGN KEY | 植物百科ID |
| name | VARCHAR | 50 | NOT NULL | 植物名称 |
| english_name | VARCHAR | 100 | | 英文名称 |
| image_url | VARCHAR | 255 | | 植物图片URL |
| position | VARCHAR | 50 | | 种植位置 |
| water_interval | INT | | DEFAULT 7 | 浇水间隔(天) |
| health_status | VARCHAR | 20 | DEFAULT 'healthy' | 健康状态 |
| add_time | DATE | | NOT NULL | 添加日期 |
| last_water_at | DATE | | | 最后浇水日期 |
| next_water_at | DATE | | | 下次浇水日期 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_at | DATETIME | | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_user_id` (user_id)
- `idx_user_plant` (user_id, plant_id)
- `idx_next_water_at` (next_water_at)

**健康状态枚举**:
- `healthy`: 健康
- `warning`: 需关注
- `diseased`: 患病
- `unknown`: 未知

---

### 3.4 养护记录表（care_record）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 记录ID，UUID |
| plant_id | VARCHAR | 36 | FOREIGN KEY | 花园植物ID |
| task_type | VARCHAR | 20 | NOT NULL | 任务类型 |
| task_name | VARCHAR | 50 | NOT NULL | 任务名称 |
| status | VARCHAR | 20 | DEFAULT 'pending' | 状态 |
| deadline | DATE | | | 截止日期 |
| complete_at | DATETIME | | | 完成时间 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_plant_id` (plant_id)
- `idx_deadline` (deadline)
- `idx_status` (status)

**任务类型枚举**:
- `water`: 浇水
- `fertilize`: 施肥
- `prune`: 修剪
- `spray`: 喷药
- `other`: 其他

**状态枚举**:
- `pending`: 待处理
- `completed`: 已完成
- `overdue`: 已过期

---

### 3.5 植物识别记录表（identify_record）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 记录ID，UUID |
| user_id | VARCHAR | 36 | FOREIGN KEY | 用户ID |
| plant_id | VARCHAR | 36 | FOREIGN KEY | 识别出的植物ID |
| image_url | VARCHAR | 255 | NOT NULL | 上传图片URL |
| confidence | DECIMAL | 5,4 | NOT NULL | 识别置信度(0-1) |
| result_name | VARCHAR | 50 | NOT NULL | 识别结果名称 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_user_id` (user_id)
- `idx_plant_id` (plant_id)
- `idx_create_at` (create_at)

---

### 3.6 病虫害诊断记录表（diagnose_record）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 记录ID，UUID |
| user_id | VARCHAR | 36 | FOREIGN KEY | 用户ID |
| plant_name | VARCHAR | 50 | | 已知植物名称 |
| image_url | VARCHAR | 255 | NOT NULL | 上传图片URL |
| disease_name | VARCHAR | 100 | NOT NULL | 病害名称 |
| disease_type | VARCHAR | 50 | | 病害类型 |
| confidence | DECIMAL | 5,4 | NOT NULL | 诊断置信度(0-1) |
| symptoms | TEXT | | | 症状描述 |
| cause | TEXT | | | 发病原因 |
| treatment | JSON | | | 处理方案数组 |
| preventive | JSON | | | 预防措施数组 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_user_id` (user_id)
- `idx_disease_name` (disease_name)
- `idx_create_at` (create_at)

---

### 3.7 园艺资讯表（article）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 资讯ID，UUID |
| title | VARCHAR | 200 | NOT NULL | 资讯标题 |
| content | LONGTEXT | | NOT NULL | 资讯内容(HTML) |
| summary | TEXT | | | 摘要 |
| category | VARCHAR | 20 | | 分类 |
| image_url | VARCHAR | 255 | | 封面图片 |
| view_count | INT | | DEFAULT 0 | 查看次数 |
| publish_time | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 发布时间 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| update_at | DATETIME | | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- `idx_category` (category)
- `idx_publish_time` (publish_time)
- `idx_view_count` (view_count)

**分类枚举**:
- `care`: 养护技巧
- `pest`: 病虫害防治
- `design`: 花园设计
- `knowledge`: 植物知识

---

### 3.8 园艺小贴士表（daily_tip）

| 字段名 | 类型 | 长度 | 约束 | 说明 |
|--------|------|------|------|------|
| id | VARCHAR | 36 | PRIMARY KEY | 小贴士ID，UUID |
| title | VARCHAR | 100 | NOT NULL | 标题 |
| content | TEXT | | NOT NULL | 内容 |
| image_url | VARCHAR | 255 | | 配图URL |
| date | DATE | UNIQUE, NOT NULL | 日期 |
| create_at | DATETIME | | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- `idx_date` (date)

---

## 4. 数据字典

### 4.1 健康状态

| 状态值 | 显示名称 | 说明 |
|--------|----------|------|
| healthy | 健康 | 植物状态良好 |
| warning | 需关注 | 需要注意养护 |
| diseased | 患病 | 已发现病害 |
| unknown | 未知 | 状态未知 |

### 4.2 养护任务类型

| 类型值 | 显示名称 | 说明 |
|--------|----------|------|
| water | 浇水 | 给植物浇水 |
| fertilize | 施肥 | 施加肥料 |
| prune | 修剪 | 修剪枝叶 |
| spray | 喷药 | 喷洒药剂 |
| other | 其他 | 其他养护任务 |

### 4.3 任务状态

| 状态值 | 显示名称 | 说明 |
|--------|----------|------|
| pending | 待处理 | 任务尚未完成 |
| completed | 已完成 | 任务已完成 |
| overdue | 已过期 | 任务已过截止日期 |

### 4.4 资讯分类

| 分类值 | 显示名称 | 说明 |
|--------|----------|------|
| care | 养护技巧 | 植物养护相关 |
| pest | 病虫害防治 | 病虫害诊断与防治 |
| design | 花园设计 | 花园规划设计 |
| knowledge | 植物知识 | 植物科普知识 |

---

## 5. 数据库初始化

### 5.1 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS ai_garden_assist 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;
```

### 5.2 使用数据库

```sql
USE ai_garden_assist;
```

### 5.3 创建用户表

```sql
CREATE TABLE IF NOT EXISTS user (
  id VARCHAR(36) PRIMARY KEY,
  open_id VARCHAR(64) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  avatar_url VARCHAR(255),
  plant_count INT DEFAULT 0,
  identify_count INT DEFAULT 0,
  diagnose_count INT DEFAULT 0,
  create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_open_id (open_id),
  INDEX idx_create_at (create_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. 数据安全

### 6.1 备份策略
- 每日凌晨全量备份
- 每小时增量备份
- 备份保留30天

### 6.2 权限管理
- 应用用户只授予必要的读写权限
- 禁止应用用户执行DROP、TRUNCATE等危险操作
- 定期轮换数据库密码

### 6.3 数据加密
- 敏感信息（如用户手机号）加密存储
- 传输层使用HTTPS加密

---

## 7. 性能优化

### 7.1 索引优化
- 为频繁查询的字段创建索引
- 避免创建过多索引影响写入性能
- 使用复合索引优化多条件查询

### 7.2 查询优化
- 使用分页查询避免一次性加载大量数据
- 合理使用JOIN，避免笛卡尔积
- 定期分析慢查询日志

### 7.3 缓存策略
- 使用Redis缓存热门植物数据
- 缓存用户会话信息
- 设置合理的缓存过期时间