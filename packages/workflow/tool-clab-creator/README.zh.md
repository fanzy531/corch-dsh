# @deepseek-ai/dsh-tool-clab-creator

[English](README.md) | 中文

CLAB Creator 工作台的 host 配套包。它注册类型化工具 `clab_creator`，向调用 agent 的会话追加一条 `clab/content` 仅日志事件；浏览器包会把每条事件折叠为 keyed Conversation 节点。

工具不直接保存文件，也不执行发布。后续的存储实现可以复用同一事件词汇，不需要增加第二套聊天系统。

## 模型体验

### 系统提示

#### 模型看到的内容

插件启用时，当前请求会收到简短指导：在当前创作 Conversation 中使用 `clab_creator` 保存大纲、草稿或定稿 Markdown 快照。

##### CLAB Creator 指导

```markdown
When the user is working on a social content project, use clab_creator to save an outline, draft, or final Markdown snapshot into the creator Conversation. Do not create a second chat system. The tool applies only to the current project.
```

#### Token 影响

插件启用期间，每个请求增加少量固定指导文本。

#### KV Cache 影响

只要注册关系和指导文本不变，前缀即可稳定复用。

### 工具调用与结果

#### 模型看到的内容

工具可见时，`clab_creator` 接受完整 Markdown 快照、阶段、标题、平台和保存后的状态。结果是简短的保存阶段确认；持久化的 `clab/content` 事件由浏览器包投影为 Conversation 节点。

#### Token 影响

每次调用增加少量固定 schema 文本，以及 Markdown 快照和简短结果。

#### KV Cache 影响

每次工具调用追加内容；已有请求前缀缓存仍可复用。

## 已知限制与后续工作

- 工具有意不保存文件系统 Markdown 文档；浏览器演示只使用轻量本地 store 保存作品元数据。
- 发布 API、WordPress ACF 映射、agent-reach 结果持久化、markitdown 转换和图像生成留待后续。
