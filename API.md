# AI园林助手 - API接口文档

## 1. 基础信息

### 1.1 接口地址
- **开发环境**: `http://localhost:3000/api`
- **生产环境**: `https://api.example.com`

### 1.2 请求头

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | 是 | `application/json` |
| Authorization | string | 否 | `Bearer {token}` |

### 1.3 响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，0表示成功 |
| message | string | 提示信息 |
| data | any | 响应数据 |

### 1.4 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未登录 |
| 1003 | 权限不足 |
| 2001 | 植物识别失败 |
| 2002 | 病虫害诊断失败 |
| 3001 | 图片上传失败 |

---

## 2. 植物识别接口

### 2.1 识别植物

**接口地址**: `POST /api/plant/identify`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | string | 是 | Base64编码的图片数据 |
| imageType | string | 是 | 图片类型，如: jpg, png |

**请求示例**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "imageType": "jpg"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "name": "月季花",
    "englishName": "Rosa chinensis",
    "family": "蔷薇科",
    "genus": "蔷薇属",
    "confidence": 0.95,
    "description": "月季花被称为花中皇后，又称月月红，是常绿、半常绿低矮灌木，四季开花",
    "careTips": {
      "water": "每周浇水2-3次，保持土壤湿润",
      "light": "喜光，每天至少6小时光照",
      "temperature": "适宜温度15-25℃",
      "fertilizer": "每月施一次复合肥"
    },
    "imageUrl": "https://example.com/images/plant/rose.jpg"
  }
}
```

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 植物名称 |
| englishName | string | 英文名称 |
| family | string | 科名 |
| genus | string | 属名 |
| confidence | number | 识别置信度(0-1) |
| description | string | 植物描述 |
| careTips | object | 养护要点 |
| imageUrl | string | 植物参考图片 |

---

## 3. 病虫害诊断接口

### 3.1 诊断病害

**接口地址**: `POST /api/diagnose/detect`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | string | 是 | Base64编码的病株图片 |
| plantName | string | 否 | 已知植物名称 |

**请求示例**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "plantName": "月季花"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "diseaseName": "月季黑斑病",
    "diseaseType": "真菌性病害",
    "confidence": 0.88,
    "symptoms": "叶片出现圆形或不规则形黑色斑点，严重时叶片脱落",
    "cause": "由放线孢菌引起，高温高湿环境易发病",
    "treatment": [
      "及时清除病叶并烧毁",
      "喷洒50%多菌灵可湿性粉剂500倍液",
      "加强通风，避免叶片积水"
    ],
    "preventive": [
      "定期喷洒保护性杀菌剂",
      "合理密植，保持通风透光",
      "避免连作"
    ]
  }
}
```

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| diseaseName | string | 病害名称 |
| diseaseType | string | 病害类型 |
| confidence | number | 诊断置信度(0-1) |
| symptoms | string | 症状描述 |
| cause | string | 发病原因 |
| treatment | array | 处理方案 |
| preventive | array | 预防措施 |

---

## 4. 花园管理接口

### 4.1 获取花园植物列表

**接口地址**: `GET /api/garden/plants`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "1",
        "name": "月季花",
        "imageUrl": "https://example.com/images/plant/rose.jpg",
        "addTime": "2026-01-15",
        "lastWaterTime": "2026-07-18",
        "waterInterval": 3,
        "healthStatus": "healthy",
        "position": "阳台"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

### 4.2 添加植物到花园

**接口地址**: `POST /api/garden/plants`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 植物名称 |
| englishName | string | 否 | 英文名称 |
| imageUrl | string | 否 | 植物图片 |
| waterInterval | number | 否 | 浇水间隔(天)，默认7 |
| position | string | 否 | 种植位置 |

**请求示例**:
```json
{
  "name": "月季花",
  "englishName": "Rosa chinensis",
  "imageUrl": "https://example.com/images/plant/rose.jpg",
  "waterInterval": 3,
  "position": "阳台"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "添加成功",
  "data": {
    "id": "1",
    "name": "月季花",
    "addTime": "2026-07-20"
  }
}
```

### 4.3 删除花园植物

**接口地址**: `DELETE /api/garden/plants/:id`

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 植物ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "删除成功",
  "data": {}
}
```

### 4.4 更新植物信息

**接口地址**: `PUT /api/garden/plants/:id`

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 植物ID |

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 植物名称 |
| waterInterval | number | 否 | 浇水间隔 |
| position | string | 否 | 种植位置 |

**响应示例**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {}
}
```

### 4.5 记录浇水

**接口地址**: `POST /api/garden/plants/:id/water`

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 植物ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "浇水成功",
  "data": {
    "lastWaterTime": "2026-07-20",
    "nextWaterTime": "2026-07-23"
  }
}
```

### 4.6 获取养护日历

**接口地址**: `GET /api/garden/calendar`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 否 | 查询日期，格式: YYYY-MM-DD |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "date": "2026-07-20",
    "tasks": [
      {
        "id": "1",
        "plantId": "1",
        "plantName": "月季花",
        "taskType": "water",
        "taskName": "浇水",
        "status": "pending",
        "deadline": "2026-07-20"
      }
    ]
  }
}
```

**响应字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| date | string | 查询日期 |
| tasks | array | 养护任务列表 |
| taskType | string | 任务类型: water(浇水), fertilize(施肥), prune(修剪) |
| status | string | 状态: pending(待处理), completed(已完成) |

---

## 5. 植物百科接口

### 5.1 搜索植物

**接口地址**: `GET /api/plant/search`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "1",
        "name": "月季花",
        "englishName": "Rosa chinensis",
        "family": "蔷薇科",
        "imageUrl": "https://example.com/images/plant/rose.jpg"
      }
    ],
    "total": 50
  }
}
```

### 5.2 获取植物详情

**接口地址**: `GET /api/plant/:id`

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 植物ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "1",
    "name": "月季花",
    "englishName": "Rosa chinensis",
    "family": "蔷薇科",
    "genus": "蔷薇属",
    "origin": "中国",
    "description": "月季花被称为花中皇后，又称月月红",
    "careTips": {
      "water": "每周浇水2-3次",
      "light": "喜光，每天至少6小时光照",
      "temperature": "15-25℃",
      "fertilizer": "每月施一次复合肥"
    },
    "features": [
      "四季开花",
      "花色丰富",
      "香气浓郁"
    ],
    "imageUrl": "https://example.com/images/plant/rose.jpg"
  }
}
```

### 5.3 获取热门植物

**接口地址**: `GET /api/plant/hot`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量，默认10 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "1",
      "name": "月季花",
      "imageUrl": "https://example.com/images/plant/rose.jpg",
      "viewCount": 12345
    }
  ]
}
```

---

## 6. 用户接口

### 6.1 用户登录

**接口地址**: `POST /api/user/login`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| openId | string | 是 | 小程序OpenID |
| nickname | string | 否 | 用户昵称 |
| avatarUrl | string | 否 | 用户头像 |

**请求示例**:
```json
{
  "openId": "o1234567890abcdef",
  "nickname": "园艺爱好者",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "1",
      "openId": "o1234567890abcdef",
      "nickname": "园艺爱好者",
      "avatarUrl": "https://example.com/avatar.jpg",
      "createTime": "2026-01-01"
    }
  }
}
```

### 6.2 获取用户信息

**接口地址**: `GET /api/user/info`

**请求头**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | `Bearer {token}` |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "1",
    "openId": "o1234567890abcdef",
    "nickname": "园艺爱好者",
    "avatarUrl": "https://example.com/avatar.jpg",
    "plantCount": 10,
    "identifyCount": 50,
    "diagnoseCount": 15
  }
}
```

### 6.3 更新用户信息

**接口地址**: `PUT /api/user/info`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 用户昵称 |
| avatarUrl | string | 否 | 用户头像 |

**响应示例**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {}
}
```

---

## 7. 文件上传接口

### 7.1 上传图片

**接口地址**: `POST /api/upload/image`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 图片文件 |
| type | string | 否 | 图片类型: plant(植物), diagnose(诊断), avatar(头像) |

**响应示例**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/2026/07/20/xxx.jpg",
    "width": 1024,
    "height": 768
  }
}
```

---

## 8. 园艺资讯接口

### 8.1 获取园艺小贴士

**接口地址**: `GET /api/tips/daily`

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "1",
    "title": "夏季养花小贴士",
    "content": "夏季高温，花卉养护要注意遮阴降温，早晚浇水，避免正午浇水导致根系受损",
    "imageUrl": "https://example.com/tips/summer.jpg",
    "date": "2026-07-20"
  }
}
```

### 8.2 获取资讯列表

**接口地址**: `GET /api/article/list`

**请求参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10 |
| category | string | 否 | 分类: care(养护), pest(病虫害), design(设计) |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "1",
        "title": "月季养护全攻略",
        "summary": "从选苗到养护，全面介绍月季种植技巧",
        "imageUrl": "https://example.com/articles/rose-care.jpg",
        "category": "care",
        "viewCount": 1234,
        "publishTime": "2026-07-15"
      }
    ],
    "total": 100
  }
}
```

### 8.3 获取资讯详情

**接口地址**: `GET /api/article/:id`

**路径参数**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 资讯ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "1",
    "title": "月季养护全攻略",
    "content": "<p>月季花是中国传统名花...</p>",
    "imageUrl": "https://example.com/articles/rose-care.jpg",
    "category": "care",
    "viewCount": 1234,
    "publishTime": "2026-07-15"
  }
}
```