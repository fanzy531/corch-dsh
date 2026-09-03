# Agent Note: CLAB shares the native sidebar browser through a mode chain

Status: implemented

English | [中文](2026-09-02-clab-sidebar-mode-switch.zh.md)

## Problem

CLAB used to register the sidebar browsing slot as a replacement, so the creator project list removed the native session browser from the application.

## Decision

The sidebar shell declares `sidebar.workspaces` as a root chain and owns a small `sessions | projects` mode state. The native WorkspaceBrowser selects the sessions mode, and CLAB selects the projects mode. Both components receive the same owner callbacks and render their own mode switch; the shell renders the chain with `renderSlotChain`.

The mode state is local to the sidebar shell and is not persisted. The default is the native sessions view, which preserves the platform's starting surface. The chain reuses the existing sidebar column and layout service; it adds no column, session implementation, or second browser.

When the shell switches to the native sessions mode, it closes the layout-owned details panel so a creator workbench cannot remain expanded beside the session browser. Switching to projects leaves details opening to the selected project as before.

## Alternatives considered

**Let CLAB keep replacing the native slot.** This makes the plugin unusable as an optional creator surface because native sessions disappear whenever CLAB is loaded.

**Add a second sidebar column or copy WorkspaceBrowser.** This duplicates platform UI and creates ownership and layout drift for a problem that the existing chain slot already solves.

## Consequences

CLAB no longer shadows native sessions and can coexist with the standard workspace plugin. The two browser registrations now depend on the shared owner mode, so test shells and generated client catalogs must use the chain owner and renderer. Switching modes remounts the selected browser, which is acceptable because its existing store and session state remain owned by their registration.
