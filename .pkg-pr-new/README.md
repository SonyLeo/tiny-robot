# pkg.pr.new 配置

这个目录包含 StackBlitz 模板配置。

## 目录结构

```
.pkg-pr-new/
├── template/              # StackBlitz 模板
│   ├── src/
│   │   ├── App.vue       # 主组件示例
│   │   ├── main.ts       # 入口文件
│   │   └── style.css     # 样式
│   ├── .stackblitzrc     # StackBlitz 配置
│   ├── package.json      # 依赖配置
│   ├── vite.config.ts    # Vite 配置
│   └── index.html        # HTML 入口
└── stackblitz.json       # 全局 StackBlitz 配置（已弃用，使用 .stackblitzrc）
```

## 工作原理

1. PR 创建时，pkg.pr.new 自动发布预览包
2. Bot 在 PR 评论中生成 "Open in StackBlitz" 链接
3. 点击链接后，StackBlitz 使用此模板创建项目
4. 自动注入 PR 的预览包并启动开发服务器

## StackBlitz 配置说明

### .stackblitzrc 文件

模板中的 `.stackblitzrc` 文件配置了 StackBlitz 的启动行为：

```json
{
  "startCommand": "npm run dev",
  "installDependencies": true
}
```

- `startCommand`: 指定启动命令（默认会查找 `dev` 或 `start` 脚本）
- `installDependencies`: 自动安装依赖

### URL 格式建议

为了避免用户修改代码时页面重载，建议使用 `/fork` 前缀的 URL：

```
https://stackblitz.com/fork/github/用户名/仓库名/tree/分支名/路径
```

而不是：

```
https://stackblitz.com/github/用户名/仓库名/tree/分支名/路径
```

## 性能优化

### 添加 package-lock.json

为了优化 StackBlitz 加载速度，建议在模板目录中添加 `package-lock.json` 文件：

```bash
cd .pkg-pr-new/template
npm install
```

这样 StackBlitz 就不需要重新解析依赖关系，可以显著提升启动速度。

## 修改模板

直接编辑 `template/src/App.vue` 来更新默认示例。

保持模板简洁，只包含基础示例即可。
