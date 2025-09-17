# 构建产物命名统一迁移指南

## 变更概述

为了统一三个包的构建产物命名，我们采用了 `.esm.js` 后缀作为 ESM 模块的标准命名约定。

## 变更详情

### 之前的命名
- **components**: `index.mjs` (ESM)
- **kit**: `index.js` (CJS) + `index.mjs` (ESM)
- **svgs**: `tiny-robot-svgs.js` (ESM)

### 统一后的命名
- **components**: `index.esm.js` (ESM)
- **kit**: `index.cjs` (CJS) + `index.esm.js` (ESM)
- **svgs**: `index.esm.js` (ESM)

## 配置变更

### 1. Components 包
- **vite.config.ts**: 更新 `fileName` 和 `entryFileNames` 为 `.esm.js` 后缀
- **package.json**: 更新 `main` 和 `module` 字段指向新的文件名

### 2. Kit 包
- **package.json**: 
  - 更新构建脚本使用 `--out-extension` 参数
  - 更新 `main` 指向 `index.cjs`
  - 更新 `module` 指向 `index.esm.js`

### 3. SVGs 包
- **vite.config.ts**: 更新 `fileName` 为 `index.esm`
- **package.json**: 更新 `module` 字段指向新的文件名

## 迁移步骤

1. **重新构建所有包**:
   ```bash
   # 构建 components 包
   cd packages/components && pnpm run build
   
   # 构建 svgs 包  
   cd packages/svgs && pnpm run build
   
   # 构建 kit 包
   cd packages/kit && pnpm run build
   ```

2. **更新导入路径** (如果有直接引用构建产物):
   - 将 `@opentiny/tiny-robot-svgs/dist/tiny-robot-svgs.js` 更新为 `@opentiny/tiny-robot-svgs/dist/index.esm.js`
   - 其他包通过 package.json 的 `module` 字段自动解析，无需手动更新

3. **验证构建结果**:
   ```bash
   # 检查构建产物
   ls packages/components/dist/  # 应该看到 index.esm.js
   ls packages/kit/dist/         # 应该看到 index.cjs 和 index.esm.js
   ls packages/svgs/dist/        # 应该看到 index.esm.js
   ```

## 实施完成状态

✅ **Components 包**: 已更新为 `index.esm.js`  
✅ **Kit 包**: 已更新为 `index.cjs` (CJS) + `index.esm.js` (ESM)  
✅ **SVGs 包**: 已更新为 `index.esm.js`  
✅ **配置文件**: 所有 vite.config.ts 和 package.json 已更新  
✅ **构建验证**: 所有包构建成功

## 优势

✅ **统一性**: 所有包使用相同的命名约定  
✅ **清晰性**: 文件名明确表示模块格式  
✅ **标准化**: 符合业界最佳实践  
✅ **维护性**: 便于后续维护和扩展  

## 注意事项

- 这是一个破坏性变更，现有直接引用构建产物路径的代码需要更新
- 通过 package.json 正常导入的代码不受影响
- 建议在发布前充分测试所有导入路径