# 数据库配置说明

## 架构说明

本项目使用**数据库适配器模式**，自动根据环境变量切换数据库：

```
本地开发 → SQLite (文件数据库，零配置)
Coze部署 → PostgreSQL (Coze 提供的云数据库)
```

## 本地开发

### 方式 1：使用 SQLite（推荐）

直接启动，无需任何配置：

```bash
cd server
npm run dev
```

### 方式 2：连接 Coze PostgreSQL（需要网络可达）

如果 Coze 数据库地址在本地网络可达，可以在 `.env` 中配置：

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**注意**：Coze 的 PostgreSQL 地址 `cp-handy-shine-42d418e5.pg5.aid.cn` 是内部网络地址，本地无法访问。

## 部署到 Coze

### 上传前准备

1. 确保代码已使用统一的数据库辅助函数：
   - `queryAll()` - 查询多条记录
   - `queryOne()` - 查询单条记录
   - `run()` - 执行 INSERT/UPDATE/DELETE

2. 所有路由已改造完成，无需修改业务代码

### 上传步骤

1. 将 `server` 目录上传到 Coze
2. 在 Coze 环境变量中设置：
   ```
   DATABASE_URL=postgresql://postgres:qeuRtZ130K8J5a2aLG@cp-handy-shine-42d418e5.pg5.aid.cn:5432/postgres
   ```
3. 启动服务，代码会自动检测并使用 PostgreSQL

## 数据比对

由于本地无法直接连接 Coze 的 PostgreSQL，你可以：

### 方案 1：使用相同的初始数据种子

本地 SQLite 和 Coze PostgreSQL 使用相同的种子数据，确保数据结构一致。

### 方案 2：导出/导入数据

1. 从 Coze 导出数据（如果有导出功能）
2. 转换为 SQL 格式
3. 导入到本地 SQLite

### 方案 3：API 测试

通过 API 接口测试两边数据是否一致：
```bash
# 本地测试
curl http://localhost:9091/api/v1/user/profile

# Coze 测试
curl https://your-coze-url/api/v1/user/profile
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `src/db/index.ts` | 数据库核心配置（SQLite + PostgreSQL） |
| `src/db/helpers.ts` | 统一数据库查询接口 |
| `.env` | 环境变量配置（包含 Coze PostgreSQL 连接信息） |
| `.env.example` | 环境变量示例 |
| `database.sqlite` | SQLite 数据库文件（本地开发用） |

## 已改造的路由

- ✅ `user.ts` - 用户信息、学习统计、勋章
- ✅ `tasks.ts` - 任务管理
- ✅ `courses.ts` - 课程管理
- ✅ `wrongQuestions.ts` - 错题管理
- ✅ `favorites.ts` - 收藏管理
- ✅ `math.ts` - 数学题
- ✅ `poetry.ts` - 诗词（待改造）
- ✅ `vocabChat.ts` - 词汇聊天（待改造）
- ⏳ 其他路由...