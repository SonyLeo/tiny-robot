# Chat Web Component 独立消费验证

验证页目前未运行。三个端口分别用于验证切片 4178、原生安装宿主 4179、Angular 生产宿主 4180。页面源码、测试和体积报告在仓库中；构建目录与 tarball 为本地生成物，不纳入提交。

在仓库根目录安装好项目依赖后，重建正式包并生成独立宿主的 tarball：

```powershell
pnpm --filter @opentiny/tiny-robot-chat-web-component build
npm pack ./packages/chat-web-component --pack-destination ./verification/chat-web-component-consumer
```

在两个宿主各自安装本地 tarball 依赖；首次安装 Angular 工程还会安装其项目依赖。随后构建 Angular 生产页面：

```powershell
npm --prefix ./verification/chat-web-component-consumer install
npm --prefix ./verification/chat-web-component-angular install
npm --prefix ./verification/chat-web-component-angular run build
```

如果在相同版本号下重新打包，`npm install` 可能保留旧的已安装文件。此时进入两个宿主目录，分别对上面的 `.tgz` 路径执行一次显式 `npm install --force --ignore-scripts <tarball路径>`，再核对已安装 `dist/index.js` 与 `packages/chat-web-component/dist/index.js` 的 SHA-256。

在各自目录执行 `node server.mjs` 可分别打开 `http://localhost:4179/` 和 `http://localhost:4180/`。验证切片从 `packages/chat` 执行 `pnpm exec vite build --config vite.web-component.config.ts`，再执行 `node verification/web-component/server.mjs` 打开 4178。相关浏览器检查在 `packages/test` 中通过 `playwright.wc-package.config.ts`、`playwright.wc-angular.config.ts` 和 `playwright.wc.config.ts` 运行。接入契约见 `packages/chat-web-component/README.md`，验收范围见 `packages/chat/verification/web-component/RESULTS.md`。
