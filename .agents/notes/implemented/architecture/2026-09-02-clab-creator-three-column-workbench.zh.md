# Agent Note: CLAB Creator uses the existing details surface as the middle workbench

Status: implemented

[English](2026-09-02-clab-creator-three-column-workbench.md) | 中文

## Problem

创作体验需要在同一界面中同时提供作品列表、tab 工作台和普通 Conversation。现有 Web frame 只有侧栏、conversation 和 details 三列，而且 details 物理上位于最右侧，并由工具检查界面拥有。

## Decision

frame 仍然只保留三条 grid track，但渲染顺序改为 `sidebar | details | conversation`。details owner 保留原有工具输出回退，并声明可增量使用的 `conversation.details.context` 子插槽。CLAB Creator 以较低 shadowing priority 占用作品浏览区域，并占用 context 子插槽提供工作台。

host 工具与浏览器 UI 在同一个可安装 patch 中拆为两个包。host 包拥有 `clab/content` 事件和 `clab_creator` 工具；浏览器包拥有插槽注册、作品 store、工作台和 keyed Conversation renderer。这保持了仓库要求的 host/client 编译面分离。

首版使用小型浏览器持久化作品索引和可演示的本地搜索回退，不增加文件系统存储、WYSIWYG 编辑器、发布 API 或第四列。

## Alternatives considered

**增加第四列。** 这更接近截图的字面结构，但会违反现有 frame 契约，并增加响应式和 layout service 改动。

**替换整个 details 插槽。** 这会移除已经提供的工具详情渲染，使无关工具无法检查。增加 context 子插槽可以保留该渲染作为回退。

**在一个 TypeScript 项目中同时放 host 与 browser 代码。** 这会让 host 和 client 的 `Context` 面合并，使 `ctx.sessions` 解析到不兼容的服务。分包可以保持编译面和运行时归属明确。

**为创作内容创建第二套聊天界面。** 这会重复 Conversation 状态，也违背内容保存仍属于普通会话历史的要求。仅日志事件和 keyed renderer 可以保持单一对话。

## Consequences

用较小的平台扩展即可实现目标视觉，details 的打开和宽度继续使用 `ctx.layout`。未安装创作 context 时，工具详情仍然可用。首版演示明确不是生产存储：浏览器持久化的 data URL 和回退搜索结果用于展示流程，发布前需要替换。
