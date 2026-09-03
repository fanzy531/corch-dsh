# Agent Note: CLAB stages materials in the native Conversation draft

Status: implemented

English | [中文](2026-09-02-clab-material-draft-context.zh.md)

## Problem

The materials action must let a creator select several references and write an instruction before model processing starts. Sending each reference through `session.prompt` turns a selection gesture into a Conversation turn and prevents controlled batching.

## Decision

CLAB uses the existing session-scoped input facade and the `conversation.input.dock` slot. Selecting materials appends human-readable Markdown blocks to the native text draft and records their ids in the project store. The dock displays the staged material names with per-item removal. Multi-select in the materials tree appends one batch, while repeated selection does not duplicate a block.

The native Composer remains the only send path. A staged material operation does not call `session.prompt`; the normal DSH send action submits the edited draft. After a successful submission returns the input machine to an empty idle draft, CLAB clears the staged ids. A failed submission retains the draft and staged ids for correction and retry.

The latest `clab-content` nodes in the Conversation are projected into the workbench outline, content, and status fields. The workbench remains authoritative for the project title and target platform, so model snapshot metadata cannot overwrite them.

Every material has a preview action. Text uploads render their file text, image uploads render their browser preview, and binary uploads render a conversion placeholder. Search results are stored with a Markdown metadata preview containing the publisher and source URL.

## Alternatives considered

**Submit a prompt for every material.** This starts processing before the user supplies an instruction and cannot provide one combined multi-material context.

**Extend the platform with generic non-image Composer attachments.** This would provide a more native file rail, but adds a cross-package input contract and serialization path that the lightweight first release does not need.

**Keep staged ids only in a CLAB-only panel.** The model would not receive the selected material content through the native send path unless CLAB also intercepted submission. Writing the content into the existing native draft keeps one Conversation and reuses the platform's send, retry, and draft semantics.

## Consequences

The first release supports explicit, batched material processing without a second chat system or a new platform attachment contract. The staged blocks are intentionally visible and editable text, so creators can revise or remove material before sending. Raw binary files remain outside durable attachment storage, and image materials contribute a textual reference note rather than a native image attachment until a generic material or image-reference path is selected.
