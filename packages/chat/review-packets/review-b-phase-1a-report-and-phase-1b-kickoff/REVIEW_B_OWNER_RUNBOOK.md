# Review B Owner Runbook

## 1. 这份文档怎么用

这份文档只给主持人和 owner 自己用，不发给评审人。

`Review B` 不是重开 `Review A`，而是做两件事：

1. 汇报 `Phase 1A` 的实现结果，判断 foundation 是否真的站住
2. 在 foundation 站住的前提下，决定是否允许进入 `Phase 1B`，并冻结 `Phase 1B` 立刻会依赖的 contract

这场会的重点不是“实现写了多少”，而是：

- `Review A` 冻结的 contract 有没有在实现里被守住
- `Phase 1A` 的 tests / baseline 是否足以证明 foundation 成立
- `Phase 1B` 的 `Page / history / models / workspace / slot` contract 是否已经足够开工

## 2. 这场会的目标和输出

### 目标

- 证明 `Phase 1A` 不是只写了一批新文件，而是真的把 foundation 站住
- 明确列出实现与 `Review A` freeze 的偏差
- 判断这些偏差是否阻塞退出
- 冻结 `Phase 1B` 立刻会依赖的 API / props / slot contract

### 会议结束前必须拿到的输出

1. `Phase 1A` 的结论：`pass / pass with follow-ups / blocked`
2. 是否允许直接进入 `Phase 1B`
3. 如果不能进入，阻塞点是什么
4. 如果可以进入，`Phase 1B` 的 `Must Freeze Now` 是什么

## 3. 这场会只讨论什么

### 讨论范围

1. `Phase 1A` 已实现哪些 foundation contract
2. `Root + createRuntimeFromConfig` 是否成立
3. `messageId`、sender / attachments handoff、bridge subset 是否在实现中站住
4. targeted contract tests 和最小 baseline 是否足够证明 `Phase 1A` 成立
5. `Phase 1B` 的范围是否合理：
   `Page baseline / history / models / workspace`
6. `Phase 1B` 立刻会依赖的 API / props / slot contract 是否足够冻结

### 明确不讨论

- 是否要重写整体方向
- 为什么要重构
- 黑盒 `TrChat` 最终主路径
- Phase 3/4 parity 细节
- 最终 helper / public surface 收口
- 完整 MCP parity
- 所有 slot 的最终命名和完整 parity

如果对方把讨论带回 `Review A` 已通过的设计前提，你只问一件事：

> 这是实现把既有 freeze 打穿了，还是你希望重新打开已经通过的设计判断？

如果是前者，记到 drift。  
如果是后者，记成 follow-up，不在本轮展开。

## 4. 这场会的推荐结构

建议总时长：`35-45` 分钟。

### 第 1 段：开场，3 分钟

把定位说清楚：

> 这轮不再重新评整体方向，而是先看 `Phase 1A` 有没有真的把 foundation 站住。  
> 如果 `Phase 1A` 站住了，这场会后我希望直接进入 `Phase 1B`，所以这轮还要顺手把 `Page / history / models / workspace` 这一批立刻要编码的 contract 定下来。  
> 前半段是阶段汇报，后半段是下一阶段开工签字。

### 第 2 段：汇报 `Phase 1A` 结果，10-12 分钟

按这个顺序讲：

1. runtime foundation 做了什么
2. `Root + createRuntimeFromConfig` 做到什么程度
3. `Message / MessageList / Sender` 最小链路是否跑通
4. `messageId`、handoff、bridge subset 是否站住
5. tests / baseline 提供了哪些证据

这一段一定要持续回答两句话：

- 现在到底证明了什么
- 还没有证明什么

### 第 3 段：单独看 drift，8-10 分钟

把 drift 单独拉出来讲，不要混在实现汇报里。

重点问：

1. `Review A` 冻结的 contract 有没有被实现打穿
2. 哪些偏差只是实现细节
3. 哪些偏差已经动到了硬门禁：
   `Root` 输入边界、`messageId`、bridge subset、handoff

### 第 4 段：讲 `Phase 1B` 为什么现在该开始，5-6 分钟

只讲三层逻辑：

1. `Phase 1A` 解决了 foundation
2. 所以下一轮该解决 `Page baseline / history / models / workspace`
3. 这轮要把下一轮立刻会依赖的 contract 冻结下来

不要在这里重讲 `Review A` 的主路径设计。

### 第 5 段：集中拍板 `Phase 1B` contract，10-12 分钟

按下面顺序问：

1. `Phase 1A` 是否退出
2. `Phase 1B` 范围是否合理
3. `TrChat.Page` baseline 的 region 组合是否合理
4. `history / models / workspace` 的 page consumption 边界是否合理
5. 哪些 slot scope 进入 `Phase 1B`
6. 哪些内容留到 `Review C`

## 5. 你要重点观察的反馈类型

### 可以接受的反馈

- “foundation 成立了，但某个 tests 还要补强”
- “`Phase 1B` 范围合理，但 slot scope 再收一收”
- “`Page baseline` 可以开始，但 `Footer` 先别扩”

这类反馈通常意味着：

- `Phase 1A` 大概率可以 `pass with follow-ups`
- `Phase 1B` 也大概率能开工

### 需要特别警惕的反馈

- “我看不出 `Phase 1A` 已经证明了 foundation”
- “`Root + createRuntimeFromConfig` 其实还没站住”
- “`messageId` 和 handoff 看起来仍然只是口头定义”
- “这轮没有把 `Phase 1B` 真正要依赖的 slot / props contract 讲清楚”

这类反馈说明：

- 问题不在下一阶段
- 而在当前阶段还没收住

## 6. 六个推荐拍板问题

### 问题 1：`Phase 1A` 是否真的证明了 foundation

判断标准：

- `conversation / sender / message / attachments` baseline 是否成立
- `Root + createRuntimeFromConfig` 是否成立
- 最小 UI 主链路是否成立

### 问题 2：`Review A` 的硬门禁是否仍然成立

判断标准：

- `Root` 是否仍只吃 `{ runtime, ui }`
- `ui` 是否仍保持 display-only
- `messageId` 是否仍是稳定动作定位键
- bridge subset 是否仍然清楚

### 问题 3：证据是否足够

判断标准：

- 有没有 targeted contract tests
- 有没有最小 baseline 示例
- 有没有明确列出 drift

### 问题 4：`Phase 1B` 范围是否合理

判断标准：

- 是否聚焦 `Page baseline / history / models / workspace`
- 是否没有把黑盒主路径和最终 parity 提前拖进来

### 问题 5：`Phase 1B` 立刻依赖的 API / props contract 是否已经冻结

判断标准：

- `Page` 的核心 region 组合是否清楚
- `history / models / workspace` 的 page consumption 边界是否清楚
- `Page` 是否仍保持 composition-only

### 问题 6：`Phase 1B` 立刻依赖的 slot contract 是否已经冻结

判断标准：

- 是否已经明确哪些 slot scope 进入 `Phase 1B`
- 是否明确 slot props 不得打穿 whole runtime
- 是否明确哪些 slot 细节留到 `Review C`

## 7. 容易跑偏的话题和兜回方式

### 跑偏 1：重新讨论整体方向

兜回说法：

> 这轮默认 `Review A` 已经通过。  
> 如果你觉得方向本身有问题，我们可以记成重大阻塞；但这轮先聚焦 foundation 是否成立，以及下一阶段能不能开工。

### 跑偏 2：开始讨论黑盒最终公开面

兜回说法：

> 这轮先不讨论最终公开面。  
> 我们现在只看 `Phase 1A` 有没有站住，以及 `Phase 1B` 立刻编码依赖的 contract 是否清楚。

### 跑偏 3：开始讨论完整 slot parity

兜回说法：

> 这轮只冻结进入 `Phase 1B` 的 slot scope，不展开所有最终 slot parity。  
> 完整消费面和更细粒度命名放到 `Review C` 再看。

## 8. 会中记录模板

### 结论

- `Phase 1A`：
- 是否直接进入 `Phase 1B`：

### 六个问题的结果

- foundation：
- `Review A` 硬门禁：
- 证据充分性：
- `Phase 1B` 范围：
- `Phase 1B` API / props：
- `Phase 1B` slot contract：

### follow-ups

- 实现偏差：
- contract 偏差：
- phase / gate 问题：
- 后续项：

## 9. 会后动作

### 如果结果是 `pass`

1. 更新 tracker 中 `Review B` 状态和结论
2. 进入 `Phase 1B` 编码
3. 把实现中的 drift 和会上的修订回写到规范文档

### 如果结果是 `pass with follow-ups`

1. 先回写 `REVIEW_B_SPEC_DETAIL.md`
2. 再回写规范文档和 tracker
3. follow-ups 收口后进入 `Phase 1B`

### 如果结果是 `blocked`

1. 明确阻塞点是出在 `Phase 1A` 证明不足，还是 `Phase 1B` contract 未冻结
2. 先回改详细说明中的对应部分
3. 再决定是否重新安排 `Review B`
