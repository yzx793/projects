---
name: "run-project"
description: "启动全栈项目（服务端和客户端）。Invoke when user asks to run/start/launch the project or says '执行项目'、'启动项目'。"
---

# 项目启动指南

## 项目架构

- **服务端**：Express + TypeScript，运行在 `http://localhost:9091/`
- **客户端**：Expo React Native Web，运行在浏览器

## 启动步骤

### 1. 启动服务端

在 `e:\doudou\projects\server` 目录下执行：

```powershell
cd e:\doudou\projects\server
$env:NODE_ENV="development"
$env:PORT="9091"
npx tsx watch ./src/index.ts
```

**注意**：
- 使用PowerShell语法设置环境变量（不要用bash的export）
- 使用 `npx tsx watch` 而不是 `npm run dev`（因为npm run dev调用的是bash脚本，在Windows下会报错）
- 设置为后台长期运行进程（long_running_process）
- 等待5秒后检查启动状态

### 2. 启动客户端

在 `e:\doudou\projects\client` 目录下执行：

```powershell
cd e:\doudou\projects\client
npm start
```

**注意**：
- 设置为后台长期运行进程（long_running_process）
- 等待5秒后检查启动状态
- 客户端编译需要较长时间（约60-70秒），需要多次检查状态直到看到 "Web Bundled" 和 "Logs will appear in the browser console"
- 编译完成后使用 `OpenPreview` 工具打开预览，端口通常是 `http://localhost:19006`

## 重要提示

1. **PowerShell命令分隔符**：使用分号 `;` 而不是 `&&`（PowerShell不支持&&）
2. **服务端启动方式**：必须直接用 `npx tsx watch ./src/index.ts`，不要用 `npm run dev`
3. **环境变量设置**：PowerShell使用 `$env:VAR="value"` 格式
4. **客户端编译时间**：首次编译较慢，需要耐心等待并多次检查状态
5. **两个服务都应该在后台运行**：设置 `blocking: false`

## 验证启动成功

- 服务端：看到 "Server listening at http://localhost:9091/" 日志
- 客户端：看到 "Web Bundled" 和 "Logs will appear in the browser console" 日志