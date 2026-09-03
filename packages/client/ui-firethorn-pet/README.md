# @deepseek-ai/dsh-client-ui-firethorn-pet

English | [中文](README.zh.md)

This opt-in Web client package adds “小棘”, a cyber-pixel firethorn pet for a school-wide DSH deployment. It serves the package-owned transparent PNG through the Host Web Server and mounts the browser widget through the DSH client loader.

The pet stays in the viewport at a fixed size, can be dragged to an edge, mirrors when docked left, and bounces while pressed. Its speech bubble is hidden by default and appears only for task-specific notices from the client runtime; it does not show rotating promotional copy. Clicking the pet loads the current account panel from the Host route. Hovering selects the waving sprite; working and exhausted sprites use the same visual-state event seam. Placement is stored locally under `dsh.firethorn-pet.v1`; unavailable browser storage leaves the live widget usable.

The account panel reads `DEEPSEEK_API_KEY` through the Host credentials service and calls the DeepSeek balance endpoint from the Host process. The browser never receives the key, and the local account route is readable only by the DSH origin. The panel displays the upstream balance and currency; points are displayed when the upstream response provides a `points` or `credits` field, otherwise it displays `暂无` because the standard balance response does not define a separate points balance.

The Plugins → Plugin configuration page includes a feature-owned Firethorn pet card. Its `firethorn-pet.enabled` setting defaults to `true`; saving it to `false` hides the floating DOM widget while leaving the plugin, routes, task notices, and account behavior installed. The card follows the settings surface's staged Save, Discard, and Reset to default flow.

## Manual visual-state testing

Until conversation and balance events are connected, append `?firethorn-pet-state=working` or `?firethorn-pet-state=exhausted` to the DSH page URL and reload to preview states 3 and 4. Remove the query and reload to return to the default state; without an override, moving the mouse over the pet previews state 2.

To manually test the account panel, configure `DEEPSEEK_API_KEY` for the DSH process, open the DSH page, and click the pet. The Host route is `GET /firethorn-pet/account.json`; without a key, the panel reports that the account is unavailable. Clicking again refreshes the account request.

To manually preview a task notice, run this in the browser console:

```js
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-task', { detail: { text: '处理中\n整理本周课程资料' } }))
```

In normal use, the browser client emits this event automatically when the current task changes between idle and running; the notice uses the current task title and disappears after a few seconds.

The same states can be switched without reloading from the browser console:

```js
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-state', { detail: 'working' }))
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-state', { detail: 'exhausted' }))
window.dispatchEvent(new CustomEvent('dsh:firethorn-pet-state', { detail: 'default' }))
```

`default` clears the manual override and restores normal hover behavior. The event currently controls presentation only; a future client integration can dispatch the same event from conversation and balance lifecycle signals.

Install the package as a Web bundle layer so the default Web composition remains unchanged. Its patch inserts the Host and browser plugin row together; removing the layer removes the route and the DOM subtree through their respective Cordis disposers.

## Model Experience

None, as the package contributes browser presentation only; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- **Business triggers deferred** — working and insufficient-balance visual states do not inspect business data yet; use the manual URL or event entry points to validate their sprites. Task notices are driven by the client session list's running state and title.
- **Points source deferred** — the DeepSeek balance endpoint supplies balance data but does not guarantee a separate points field, so the panel shows `暂无` until the school points source is connected.
- **Local preference only** — placement does not sync between browsers or user profiles.
