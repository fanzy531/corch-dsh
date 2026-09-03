# @deepseek-ai/dsh-client-ui-clab-creator

English | [中文](README.zh.md)

The browser workbench for personal creators who produce Xiaohongshu notes or WordPress articles. It shares the native sidebar browsing region through a session/project mode switch and fills the existing details surface, so the composed frame is `project list | creator workbench | Conversation` when the project mode is selected.

The workbench keeps five lightweight tabs: Overview, Topics & materials, Outline, Draft, and Publish check. Project metadata and demo material indexes use a small browser-persisted store. Markdown content remains in the existing Conversation; the companion `@deepseek-ai/dsh-tool-clab-creator` records explicit Markdown saves as `ConversationNodeDefinition` nodes.

The search button submits a normal Conversation prompt that asks for `agent-reach`. The first release includes a local fallback result so the workflow remains demonstrable when that optional capability is unavailable. Uploaded text and image files, as well as saved search entries, have a preview action in the materials tree. Materials are multi-selectable and are staged in the native Conversation draft; staging does not start a model turn, and the native Send action submits the user's instruction and staged material text together.

The latest outline, draft, or final snapshot saved in Conversation is projected into the corresponding workbench tab. The user-owned project title and target platform remain authoritative in the overview and are not overwritten by model snapshot metadata.

When the first project is created without a registered Workspace, the browser reuses the Host's advertised default working directory through the existing Workspace service, then connects the ordinary session there.

The plugin does not add WYSIWYG editing, a second chat system, a fourth column, publishing APIs, WordPress ACF mapping, image generation, cross-project copying, or cloud synchronization.

## Composition

Install the package patch together with `@deepseek-ai/dsh-tool-clab-creator`. The host package owns the tool and durable event vocabulary; this package owns the browser slots, locale, workbench, project cards, and keyed renderer.

## Model Experience

### Conversation projection

#### What the model sees

The companion `clab_creator` tool is model-visible only when installed. It accepts a stage, title, platform, status, and complete Markdown snapshot, then appends one log-only event to the current session; the browser renders that event as a keyed Conversation node.

#### Token effect

This browser package adds no prompt or tool schema. Each saved snapshot is already part of the ordinary Conversation tool-call history.

#### KV Cache effect

No direct invalidation; the keyed renderer only projects logged content after the model request.

## Known Limitations and Deferred Work

- Search and upload results are demo projections; production agent-reach persistence, filesystem Markdown documents, and markitdown conversion remain deferred. Non-text uploads show a lightweight placeholder until that conversion path is connected.
- Staged materials are represented by human-readable Markdown blocks in the native text draft. The materials remain one-time context for the next send and are removed from the staged strip after a successful submission; failed submissions retain the draft for retry.
- Image references use browser-persisted data URLs in the demo and are not yet durable media assets.
- Publishing buttons are placeholders until the WordPress and Xiaohongshu delivery paths are specified.
