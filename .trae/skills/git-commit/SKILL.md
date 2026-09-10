---
name: "git-commit"
description: "提交代码到 git 仓库。Invoke when user asks to commit/push code to git or says '提交到git'、'git提交'。"
---

# Git 提交指南

## 环境信息

- **Git 路径**：`D:\software\Git\cmd\git.exe`（必须使用完整路径，因为 git 不在系统 PATH 中）
- **项目根目录**：`e:\doudou\projects`

## 重要注意事项

### 1. 必须使用完整路径

PowerShell 环境中 git 不在 PATH 中，所有 git 命令必须使用完整路径：
```powershell
D:\software\Git\cmd\git.exe <command>
```

### 2. PowerShell 括号转义问题

PowerShell 对圆括号 `()` 有特殊处理，包含括号的文件路径必须用双引号包裹：
```powershell
# 错误 - 会报错 "无法将 tabs 项识别为 cmdlet"
D:\software\Git\cmd\git.exe add client/app/(tabs)/_layout.tsx

# 正确 - 用双引号包裹
D:\software\Git\cmd\git.exe add "client/app/(tabs)/_layout.tsx"
```

### 3. 排除数据库文件

**永远不要提交 SQLite 数据库文件**：
- `server/database.sqlite` - 必须排除

## 标准提交流程

### 步骤 1：查看状态

```powershell
cd e:\doudou\projects; D:\software\Git\cmd\git.exe status
```

### 步骤 2：添加文件（排除数据库）

**方法 A：添加所有文件（推荐，但需要确认没有数据库文件）**
```powershell
cd e:\doudou\projects; D:\software\Git\cmd\git.exe add -A
# 然后取消暂存数据库文件
D:\software\Git\cmd\git.exe restore --staged server/database.sqlite
```

**方法 B：逐个添加文件（更安全）**
```powershell
cd e:\doudou\projects; D:\software\Git\cmd\git.exe add "file1" "file2" "file3"
```

### 步骤 3：提交

```powershell
cd e:\doudou\projects; D:\software\Git\cmd\git.exe commit -m "提交信息"
```

### 步骤 4：推送

```powershell
cd e:\doudou\projects; D:\software\Git\cmd\git.exe push
```

## 完整示例

```powershell
# 1. 查看状态
cd e:\doudou\projects; D:\software\Git\cmd\git.exe status

# 2. 添加所有更改
cd e:\doudou\projects; D:\software\Git\cmd\git.exe add -A

# 3. 如果有数据库文件被添加，取消暂存
D:\software\Git\cmd\git.exe restore --staged server/database.sqlite

# 4. 提交
D:\software\Git\cmd\git.exe commit -m "feat: 更新功能描述"

# 5. 推送
D:\software\Git\cmd\git.exe push
```

## 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `无法将"git"项识别为 cmdlet` | git 不在 PATH 中 | 使用完整路径 `D:\software\Git\cmd\git.exe` |
| `无法将"tabs"项识别为 cmdlet` | PowerShell 括号解析问题 | 用双引号包裹含括号的路径 |
| 数据库文件被提交 | 使用了 `git add .` | 提交前检查状态，排除 `database.sqlite` |