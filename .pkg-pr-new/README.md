# pkg.pr.new 配置

这个目录包含 StackBlitz 模板配置。

## 目录结构

```
.pkg-pr-new/
└── template/              # StackBlitz 模板
    ├── src/
    │   ├── App.vue       # 主组件示例
    │   ├── main.ts       # 入口文件
    │   └── style.css     # 样式
    ├── package.json      # 依赖配置
    ├── vite.config.ts    # Vite 配置
    └── index.html        # HTML 入口
```

## 工作原理

1. PR 创建时，pkg.pr.new 自动发布预览包
2. Bot 在 PR 评论中生成 "Open in StackBlitz" 链接
3. 点击链接后，StackBlitz 使用此模板创建项目
4. 自动注入 PR 的预览包并启动开发服务器

## 修改模板

直接编辑 `template/src/App.vue` 来更新默认示例。

保持模板简洁，只包含基础示例即可。
