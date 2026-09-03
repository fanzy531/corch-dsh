/** Package-owned DOM styles installed and removed with the client plugin. */
export const FIRETHORN_PET_CSS = `
.firethorn-pet{--firethorn-flip:1;position:fixed;z-index:9000;width:144px;height:144px;user-select:none;touch-action:none;transition:left .2s ease,top .2s ease;isolation:isolate}
.firethorn-pet.is-left{--firethorn-flip:-1}
.firethorn-pet.is-dragging{transition:none}
.firethorn-pet__body{position:absolute;inset:0;border:0;padding:0;background:transparent;cursor:grab;transform-origin:50% 100%;transition:transform .2s cubic-bezier(.34,1.56,.64,1);outline:none}
.firethorn-pet.is-dragging .firethorn-pet__body{cursor:grabbing}
.firethorn-pet.is-pressed .firethorn-pet__body{transform:scaleX(1.05) scaleY(.88)}
.firethorn-pet__sprite{display:block;width:100%;height:100%;transform:scaleX(var(--firethorn-flip));animation:firethorn-pet-idle 3.2s ease-in-out infinite;filter:drop-shadow(0 8px 10px rgba(25,30,38,.18));image-rendering:pixelated;-webkit-user-drag:none;pointer-events:none}
.firethorn-pet__bubble{position:absolute;right:8%;bottom:92%;min-width:7.5rem;max-width:14rem;padding:.55rem .75rem;border:1px solid rgba(188,70,67,.34);border-radius:14px;background:rgba(255,252,246,.96);box-shadow:0 8px 24px rgba(36,29,30,.14);color:#4b3435;font:600 13px/1.35 system-ui,sans-serif;text-align:center;white-space:nowrap;pointer-events:none;transform:translateY(0);opacity:1;transition:opacity .16s ease,transform .16s ease}
.firethorn-pet__bubble.is-account{white-space:pre-line;text-align:left;line-height:1.55}
.firethorn-pet__bubble[hidden]{display:block;opacity:0;transform:translateY(6px);visibility:hidden}
.firethorn-pet__body:focus-visible{filter:drop-shadow(0 0 0 3px rgba(188,70,67,.32))}
@keyframes firethorn-pet-idle{0%,100%{translate:0 0}50%{translate:0 -3px}}
@media (prefers-reduced-motion:reduce){.firethorn-pet,.firethorn-pet__body,.firethorn-pet__bubble{transition:none}.firethorn-pet__sprite{animation:none}}
`
