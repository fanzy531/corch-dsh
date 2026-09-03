# @deepseek-ai/dsh-tool-clab-creator

English | [中文](README.zh.md)

Host companion for the CLAB Creator workbench. It registers `clab_creator`, a typed tool that appends one `clab/content` log-only event to the calling agent's session. The browser package folds each event into a keyed Conversation node.

The tool stores no files and does not publish content. A later storage implementation can consume the same event vocabulary without adding a second chat system.

## Model Experience

### System prompt

#### What the model sees

While this package is active, the current request receives concise guidance to use `clab_creator` for outline, draft, or final Markdown snapshots in the current creator Conversation.

##### CLAB Creator guidance

```markdown
When the user is working on a social content project, use clab_creator to save an outline, draft, or final Markdown snapshot into the creator Conversation. Do not create a second chat system. The tool applies only to the current project.
```

#### Token effect

Small fixed guidance cost per request while the plugin is active.

#### KV Cache effect

Prefix-stable while the registration and guidance text remain unchanged.

### Tool call and result

#### What the model sees

When visible, `clab_creator` accepts the complete Markdown snapshot, stage, title, platform, and resulting status. Its result is a short saved-stage confirmation; the durable `clab/content` event is projected by the browser package as a Conversation node.

#### Token effect

Small fixed schema cost plus the Markdown snapshot and short result for each call.

#### KV Cache effect

Append-only after each tool call; existing request-prefix cache entries remain reusable.

## Known Limitations and Deferred Work

- The tool intentionally stores no filesystem Markdown file; the browser demo keeps project metadata in a lightweight local store.
- Publishing APIs, WordPress ACF mapping, agent-reach result persistence, markitdown conversion, and image generation are deferred.
