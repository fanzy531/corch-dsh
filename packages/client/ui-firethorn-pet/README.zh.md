# @deepseek-ai/dsh-client-ui-firethorn-pet

[English](README.md) | 中文

本可选 Web 客户端包为学校范围的 DSH 部署添加赛博像素风火棘宠物“小棘”。它通过 Host Web Server 提供包内透明 PNG，并通过 DSH 客户端 Loader 挂载浏览器宠物。

小棘会以固定大小显示在视口内，可拖拽到边缘，停靠左侧时自动镜像，按住时轻弹。头顶气泡默认隐藏，只有客户端运行时产生具体任务通知时才自动弹出，不再轮播无意义的宣传文案。点击宠物后，通过 Host 路由加载当前账户面板。鼠标悬停会显示招手姿态；工作中和积分/余额不足姿态通过同一套图片状态接口切换。位置以 `dsh.firethorn-pet.v1` 存储在本地；浏览器不允许使用存储时，运行中的宠物仍可使用。

账户面板由 Host 侧通过凭据服务读取 `DEEPSEEK_API_KEY`，再从 Host 进程调用 DeepSeek 余额接口，浏览器不会接触 API Key，本地账户路由只允许 DSH 同源页面读取。面板显示上游返回的余额和币种；只有上游响应提供 `points` 或 `credits` 字段时才显示积分，否则显示“暂无”，因为标准余额响应没有独立的积分余额字段。

“插件 → 插件配置”页面包含火棘自己的设置卡片。`firethorn-pet.enabled` 默认值为 `true`；保存为 `false` 后只隐藏浮动 DOM 宠物，插件、路由、任务通知和账户面板仍保持安装。卡片遵循设置页面统一的暂存、保存、放弃修改和恢复默认流程。

## 手动测试状态

真实对话进行中和余额不足事件暂未接入时，可在 DSH 页面 URL 后添加 `?firethorn-pet-state=working` 或 `?firethorn-pet-state=exhausted`，刷新页面分别查看状态3和状态4。删除该参数后刷新即可恢复默认状态；不带参数时，将鼠标移入宠物可查看状态2。

手动测试账户面板时，为 DSH 进程配置 `DEEPSEEK_API_KEY`，打开 DSH 页面并点击宠物。Host 路由为 `GET /firethorn-pet/account.json`；未配置 Key 时，面板会提示账户暂不可用。再次点击会重新发起账户查询。

手动预览任务通知时，可在浏览器控制台执行：

```js
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-task', { detail: { text: '处理中\n整理本周课程资料' } }))
```

正常使用时，浏览器客户端会在当前任务从空闲切换到运行中、或从运行中完成时自动派发此事件；气泡内容使用当前任务标题，并在数秒后消失。

也可以在浏览器控制台即时切换，不需要刷新：

```js
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-state', { detail: 'working' }))
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-state', { detail: 'exhausted' }))
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-state', { detail: 'default' }))
```

`default` 会清除手动覆盖并恢复正常的 hover 行为。当前状态接口只控制呈现，未来接入对话生命周期和余额服务时，应由对应的客户端 UI 事件派发同名事件。

请将本包作为 Web bundle layer 安装，这样默认 Web 组合不会改变。补丁会一起插入 Host 插件和浏览器插件条目；移除该层时，路由和 DOM 子树会分别通过各自的 Cordis disposer 移除。

## 模型体验

无，因为本包只贡献浏览器呈现；这里没有任何内容进入模型请求。

#### KV Cache 影响

无；本包既不组装也不发送 provider 请求。

## 已知限制与暂缓事项

- **业务触发暂缓** —— 工作中和余额不足目前不会自动读取业务状态，需要通过客户端事件接入；任务通知使用客户端 Session 列表中的运行状态和任务标题，手动 URL 和事件入口用于验收素材。
- **积分来源暂缓** —— DeepSeek 余额接口提供余额数据，但不保证提供独立的积分字段；学校积分系统接入前，面板会显示“暂无”。
- **只保存本地偏好** —— 位置不会在浏览器或用户配置之间同步。
