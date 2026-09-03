# @deepseek-ai/dsh-client-ui-clab-creator

[English](README.md) | 中文

面向个人创作者的小红书笔记与 WordPress 文章浏览器工作台。插件通过会话/作品模式切换共享原生侧栏浏览区域，并填充现有 details 内容位；选择作品模式后，组合界面是“作品列表｜创作工作台｜Conversation”。

工作台包含五个轻量 tab：作品总览、选题与资料、内容大纲、正文草稿、发布检查。作品元数据和演示资料索引使用浏览器本地的小型持久化 store。Markdown 内容仍保留在现有 Conversation 中；配套的 `@deepseek-ai/dsh-tool-clab-creator` 将模型明确保存的 Markdown 记录为 `ConversationNodeDefinition` 节点。

搜索按钮提交普通 Conversation 请求，要求调用 `agent-reach`。首版保留本地演示候选结果，因此即使该可选能力未安装也能演示完整流程。上传的文本、图片和已保存的搜索条目都可以在资料树中点击预览。资料支持多选，并暂存到原生 Conversation 草稿中；暂存不会启动模型轮次，用户点击原生发送后才会把用户指令和所选资料内容一起提交。

Conversation 中最新保存的大纲、草稿或定稿节点会同步到对应工作台 Tab；作品总览中的用户标题和目标平台不会被模型快照覆盖。

首次创建作品且尚未注册 Workspace 时，浏览器会通过现有 Workspace service 复用 Host 公布的默认工作目录，然后在该目录连接普通会话。

插件不增加 WYSIWYG 编辑器、第二套聊天系统、第四列、发布 API、WordPress ACF 映射、图像生成、跨作品复制或云同步。

## 组合

安装本包的 patch 时，同时安装 `@deepseek-ai/dsh-tool-clab-creator`。host 包拥有工具和持久化事件词汇；本包拥有浏览器插槽、语言包、工作台、作品卡片和 keyed renderer。

## 模型体验

### Conversation 投影

#### 模型看到的内容

配套的 `clab_creator` 工具安装后才对模型可见。工具接受阶段、标题、平台、状态和完整 Markdown 快照，并向当前会话追加一条仅日志事件；浏览器将该事件渲染为 keyed Conversation 节点。

#### Token 影响

本浏览器包不增加提示词或工具 schema。每次保存的快照已经属于普通 Conversation 工具调用历史。

#### KV Cache 影响

不直接造成失效；keyed renderer 只在模型请求之后投影已记录的内容。

## 已知限制与后续工作

- 搜索和上传结果是演示投影；生产级 agent-reach 持久化、文件系统 Markdown 文档和 markitdown 转换留待后续。接入转换流程前，非文本上传显示轻量占位说明。
- 待发送资料以可读的 Markdown 区块写入原生文本草稿。成功发送后资料从待发送条中移除，发送失败则保留草稿以便重试。
- 图片引用在演示中使用浏览器持久化的 data URL，尚未成为持久化媒体资产。
- 发布按钮是占位元素，等待 WordPress 和小红书发布路径确定。
