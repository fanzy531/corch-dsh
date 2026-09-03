# Agent Note: Remove firethorn pet size controls

Status: implemented

English | [中文](2026-08-28-remove-firethorn-pet-size-controls.zh.md)

## Problem

The floating firethorn pet only needs to provide a stable, low-distraction campus-AI presence. Size controls add visible chrome and presentation state without supporting another product behavior.

## Decision

The pet renders at the package-defined `144px` square and exposes no size controls. `PetState` contains only the dock side and normalized edge offset; `dsh.firethorn-pet.v1` persists placement only. The widget, geometry, stylesheet, exports, tests, package description, and README describe this fixed-size presentation.

## Alternatives considered

**Keep the size controls** — rejected because the extra affordance and persisted preference are not needed for the pet’s presentation role.

**Keep scale in state but hide the controls** — rejected because it preserves unused state and keeps the removed behavior in the public client types and persistence parser.

**Use responsive sizing** — rejected because viewport-dependent sizing would make the mascot’s visual identity less stable without addressing a stated product need.

## Consequences

The widget has one predictable visual footprint and a smaller browser-state record. Existing placement data with unrelated extra JSON fields is parsed as placement only; the package does not retain or migrate a size preference. Reintroducing user-selectable size requires a new interaction and state decision.

## Verification

Focused geometry, state, and widget tests verify fixed-size positioning, placement-only persistence, and the absence of extra controls. Package bundling and TypeScript checks cover the updated exports and runtime path.