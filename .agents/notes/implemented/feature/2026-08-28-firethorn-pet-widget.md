# Agent Note: Opt-in firethorn pet for the Web client

Status: implemented

English | [中文](2026-08-28-firethorn-pet-widget.zh.md)

## Problem

The school-wide DSH Web client needs a recognizable “小棘” companion that can remain visible while students and staff use the agent, without changing the default product composition or putting presentation state into model context.

## Decision

The package `@deepseek-ai/dsh-client-ui-firethorn-pet` is an opt-in dual-face Web bundle. Its Host half serves the package-owned transparent PNG through `ctx.webServer.register()`, and its browser half mounts one reversible DOM widget through `ctx.effect()`. The bundle patch inserts both faces as one Loader row.

The widget uses four package-owned front-facing cyber-pixel firethorn assets with a closed cyan-white visor frame and no background decoration: default, waving hover, working with a holographic HUD panel, and exhausted with closed eyes while lying down. Hover switches automatically; working and exhausted can be selected by the `firethorn-pet-state` query parameter or the `dsh:firethorn-pet-state` window event until business triggers are connected. The speech bubble is hidden by default and appears only for idle/running transitions of the current client task, showing its title for a short time. Clicking the pet opens a Host-served account panel. The widget also supports pointer dragging with nearest-edge docking, left-side mirroring, press bounce, fixed-size rendering, viewport re-placement, and local persistence under `dsh.firethorn-pet.v1`. The removal of the size-control surface is recorded in [the firethorn pet simplification note](../simplification/2026-08-28-remove-firethorn-pet-size-controls.md).

The Host half resolves `DEEPSEEK_API_KEY` through the credentials service and calls the DeepSeek balance endpoint for the account panel; the browser half receives only validated account JSON and never sees the key. The standard balance response does not guarantee a separate points field, so the panel reports points as unavailable until a points source is connected. The package does not inspect sessions on the Host or contribute model-visible input. Its task notice observes the client session-list summary only. The invariant companion records that the package owns the disposable Web routes and browser subtree.

The browser half registers a feature-owned `firethorn-pet` settings card in the Plugins configuration surface. Its Host schema defaults `enabled` to `true`; saving `false` hides the widget root through a live client settings scope without unloading the plugin, its routes, task notices, or account panel. The card follows the shared staged Save, Discard, and Reset to default behavior.

## Alternatives considered

**Modify the default Web bundle** — rejected because the mascot is a deployment-specific campus brand layer and should not appear in every DSH installation.

**Read account data in the browser** — rejected because it would expose `DEEPSEEK_API_KEY`; the Host route owns credential resolution and the upstream request.

**Inject the widget through the Web Server index HTML** — rejected because a client package can own its browser lifecycle directly, while the route registry only needs to serve the package asset.

**Use a CSS or SVG stand-in for the mascot** — rejected because the approved cyber-pixel transparent PNG is the brand asset and must retain its visor outline and pixel treatment.

## Consequences

The default Web composition remains unchanged until an administrator installs the patch layer. The pet position survives page reloads only within the same browser storage scope. Business-owned conversation and points/balance triggers remain deferred; task notices use only the client session list's current running state and display title, while the account panel is an explicit on-click query and does not drive the exhausted visual state. Future session-aware states require new logged/model-visible design rather than silently extending this presentation package.

The visibility preference is durable through the DSH settings document. It controls presentation only; the plugin remains part of the composition when the user turns the pet off.

## Verification

Focused account parsing, task-notice transition, geometry, persistence, visual-state, widget lifecycle, and Host route tests cover the package. All four transparent assets and the account route are owned by the Host plugin and removed with its disposer.
