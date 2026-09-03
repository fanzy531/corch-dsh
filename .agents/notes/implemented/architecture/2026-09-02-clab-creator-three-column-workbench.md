# Agent Note: CLAB Creator uses the existing details surface as the middle workbench

Status: implemented

English | [中文](2026-09-02-clab-creator-three-column-workbench.zh.md)

## Problem

The creator experience needs a project list, a tabbed workbench, and the normal Conversation in one frame. The existing Web frame has only sidebar, conversation, and details columns, while details is physically on the far right and is owned by tool inspection.

## Decision

The frame keeps exactly three grid tracks but renders them as `sidebar | details | conversation`. The details owner keeps its existing tool output fallback and declares an additive `conversation.details.context` child slot. CLAB Creator occupies the browsing-region slot with a lower shadowing priority and occupies the context child slot for its workbench.

The host tool and browser UI are separate packages in one installable patch. The host package owns the `clab/content` event and `clab_creator` tool; the browser package owns the slot registrations, project store, workbench, and keyed Conversation renderer. This preserves the repository's separate host/client compiler faces.

The first release uses a small browser-persisted project index and demonstrable local search fallback. It does not add filesystem storage, a WYSIWYG editor, publishing APIs, or a fourth column.

## Alternatives considered

**Add a fourth column.** This would match a literal reading of the screenshot but violates the existing frame contract and increases responsive and layout-service changes.

**Replace the whole details slot.** This would remove the shipped tool-details renderer and make unrelated tool inspection unavailable. The child context slot keeps that renderer as the fallback.

**Put host and browser code in one TypeScript project.** This caused the host and client `Context` faces to merge, making `ctx.sessions` resolve to incompatible services. Separate package faces keep compiler and runtime ownership explicit.

**Create a second chat surface for creator content.** This would duplicate Conversation state and break the requirement that content saves remain ordinary session history. The log-only event plus keyed renderer keeps one conversation.

## Consequences

The visual target is achievable with a small platform extension, and details opening and width continue to use `ctx.layout`. Tool details remain available whenever the creator context is not installed. The first demo is intentionally not production storage: browser-persisted data URLs and fallback search results make the workflow visible but need replacement before release.
