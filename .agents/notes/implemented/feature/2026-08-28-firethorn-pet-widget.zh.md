# Agent Note: Web 客户端的可选火棘宠物

Status: implemented

[English](2026-08-28-firethorn-pet-widget.md) | 中文

## Problem

学校范围的 DSH Web 客户端需要一个可识别的“小棘”伙伴，在师生使用 Agent 时持续可见，同时不改变默认产品组合，也不把呈现状态写入模型上下文。

## Decision

`@deepseek-ai/dsh-client-ui-firethorn-pet` 是一个可选的双半边 Web bundle。Host 半边通过 `ctx.webServer.register()` 提供包内透明 PNG，浏览器半边通过 `ctx.effect()` 挂载一个可完整撤销的 DOM 宠物。bundle 补丁会把两个半边作为一个 Loader 条目插入。

宠物使用四张包内正面赛博像素火棘资产，眼罩为闭合的青白色边框，且没有背景装饰：默认、招手 hover、手持全息 HUD 面板的工作中、闭眼趴下的疲惫状态。hover 会自动切换；业务触发尚未接入前，工作中和疲惫状态可通过 `firethorn-pet-state` URL 参数或 `dsh:firethorn-pet-state` window 事件选择。头顶气泡默认隐藏，只有当前客户端任务从空闲变为运行中或从运行中完成时，才短暂显示任务标题。点击宠物会打开由 Host 提供的账户面板。宠物还支持指针拖拽并吸附到最近边缘、停靠左侧时镜像、按住时轻弹、固定大小显示、视口变化后的重新定位，以及以 `dsh.firethorn-pet.v1` 为键的本地持久化。大小控制界面的移除记录在[火棘宠物移除大小控制简化记录](../simplification/2026-08-28-remove-firethorn-pet-size-controls.zh.md)中。

Host 半边通过凭据服务解析 `DEEPSEEK_API_KEY`，为账户面板调用 DeepSeek 余额接口；浏览器半边只接收校验后的账户 JSON，不会接触 Key。标准余额响应不保证有独立积分字段，因此在积分来源接入前，面板会报告积分不可用。本包不在 Host 侧检查会话，也不贡献模型可见输入。任务通知只读取客户端 Session 列表摘要。invariant companion 说明本包拥有可释放的 Web 路由集合和一个可释放的浏览器 DOM 子树。

浏览器半边会在“插件配置”页面注册火棘自己的 `firethorn-pet` 设置卡片。Host schema 将 `enabled` 默认设为 `true`；保存为 `false` 时，通过客户端 live settings scope 隐藏宠物根节点，但不会卸载插件、路由、任务通知或账户面板。卡片遵循统一的暂存、保存、放弃修改和恢复默认行为。

## Alternatives considered

**修改默认 Web bundle** —— 否决，因为宠物是特定部署的校园品牌层，不应出现在每个 DSH 安装中。

**在浏览器读取账户数据** —— 否决，因为这会暴露 `DEEPSEEK_API_KEY`；Host 路由负责凭据解析和上游请求。

**通过 Web Server 的 index HTML 注入宠物** —— 否决，因为客户端包可以直接拥有浏览器生命周期，而路由注册表只需提供包内资产。

**使用 CSS 或 SVG 代替角色图** —— 否决，因为已确认的赛博像素透明 PNG 是品牌资产，必须保留眼罩轮廓和像素质感。

## Consequences

管理员安装补丁层之前，默认 Web 组合保持不变。宠物的位置只会在同一浏览器存储范围内跨页面刷新保留。由业务拥有的对话和积分/余额触发条件暂缓接入；任务通知只使用客户端 Session 列表的当前运行状态和显示标题，账户面板是点击后显式查询，不会驱动趴下状态。未来的会话感知状态需要新的日志和模型可见设计，不能静默扩展本呈现包。

显示偏好会持久化在 DSH 设置文档中，只控制呈现；用户关闭宠物后，插件仍然属于当前组合。

## Verification

包内的账户解析、任务通知转换、几何、持久化、视觉状态、宠物生命周期和 Host 路由聚焦测试覆盖了主要行为。四张透明资产和账户路由均由 Host 插件拥有，并会随其 disposer 一起移除。
