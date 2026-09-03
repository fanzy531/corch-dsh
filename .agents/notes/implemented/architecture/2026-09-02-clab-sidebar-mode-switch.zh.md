# Agent Note: CLAB 通过模式链共享原生侧栏浏览区

Status: implemented

[English](2026-09-02-clab-sidebar-mode-switch.md) | 中文

## Problem

CLAB 之前以替换方式注册侧栏浏览插槽，作品列表会把应用原生会话浏览器完全移除。

## Decision

侧栏 shell 将 `sidebar.workspaces` 声明为 root chain，并持有一个轻量的“会话 | 作品”模式状态。原生 WorkspaceBrowser 选择会话模式，CLAB 选择作品模式。两个组件接收同一组 owner 回调并各自渲染模式切换控件；shell 使用 `renderSlotChain` 渲染这条链。

模式状态只属于侧栏 shell，不持久化。默认模式是原生会话视图，保持平台原有的初始界面。模式链复用现有侧栏列和布局服务，不增加列、会话实现或第二套浏览器。

外壳切换到原生会话模式时会关闭由布局服务持有的 details 面板，避免创作工作台继续显示在会话浏览器旁边。切换到作品模式时仍由选中的作品按原有流程打开 details。

## Alternatives considered

**继续让 CLAB 替换原生插槽。** 只要加载 CLAB，原生会话就会消失，插件不能作为可选的创作界面使用。

**增加第二个侧栏列或复制 WorkspaceBrowser。** 这会重复平台界面，并造成所有权和布局漂移；现有 chain slot 已经能解决这个问题。

## Consequences

CLAB 不再遮蔽原生会话列表，可以与标准 workspace 插件共存。两个浏览器注册都依赖共享 owner 模式，因此测试 shell 和生成的客户端 catalog 必须使用 chain owner 与 renderer。切换模式会重新挂载选中的浏览器，但其已有 store 和会话状态仍由各自注册负责，符合当前轻量实现范围。
