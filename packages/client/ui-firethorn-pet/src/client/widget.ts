import { parseFirethornPetAccountResponse } from '../account.ts'
import {
  FIRETHORN_PET_ACCOUNT_URL, FIRETHORN_PET_ASSET_URLS, FIRETHORN_PET_TASK_EVENT,
} from '../shared.ts'
import {
  BASE_SIZE, clamp, nearestDock, positionForDock, type PetState,
} from './geometry.ts'
import { readPetState, writePetState } from './state.ts'
import { FIRETHORN_PET_CSS } from './styles.ts'
import {
  parsePetVisualState, PET_VISUAL_STATE_EVENT, visualStateFromLocation,
  type FirethornPetVisualState,
} from './visual-state.ts'

const CLICK_DISTANCE_SQ = 9
const ACCOUNT_MS = 6_000
const TASK_NOTICE_MS = 5_000

/** Browser objects used by the mount function and replaceable in tests. */
export interface FirethornPetEnvironment {
  /** Document receiving the widget and package stylesheet. */
  document: Document
  /** Window owning pointer, resize, and timer events. */
  window: Window
  /** Persistence store, or undefined when the browser denies access. */
  storage: Storage | undefined
  /** Optional account request seam for tests and embedded clients. */
  accountFetch?: (input: string, init?: RequestInit) => Promise<Response>
  /** Whether the widget starts visible; omitted means visible. */
  visible?: boolean
}

/** Widget disposer with a live visibility control used by the settings row. */
export interface FirethornPetHandle {
  /** Remove the widget and all of its listeners. */
  (): void
  /** Show or hide the widget without unloading the plugin. */
  setVisible: (visible: boolean) => void
}

interface DragState {
  pointerId: number
  startClientX: number
  startClientY: number
  startLeft: number
  startTop: number
  moved: boolean
}

/**
 * Mount one firethorn pet and return a complete DOM/listener disposer.
 * @param environment - browser objects used by the widget.
 * @returns handle removing the widget, stylesheet, timers, and window listeners.
 */
export function mountFirethornPet(environment: FirethornPetEnvironment): FirethornPetHandle {
  const { document: doc, window: win, storage } = environment
  const style = doc.createElement('style')
  style.dataset.firethornPet = ''
  style.textContent = FIRETHORN_PET_CSS
  doc.head.append(style)

  const root = doc.createElement('div')
  root.className = 'firethorn-pet'
  root.dataset.firethornPet = ''
  root.hidden = environment.visible === false

  const bubble = doc.createElement('div')
  bubble.className = 'firethorn-pet__bubble'
  bubble.setAttribute('aria-live', 'polite')
  bubble.hidden = true

  const body = doc.createElement('button')
  body.type = 'button'
  body.className = 'firethorn-pet__body'
  body.setAttribute('aria-label', '小棘校园 AI 伙伴')
  const sprite = doc.createElement('img')
  sprite.className = 'firethorn-pet__sprite'
  sprite.src = FIRETHORN_PET_ASSET_URLS.default
  sprite.alt = ''
  sprite.draggable = false
  body.append(sprite)
  root.append(bubble, body)
  doc.body.append(root)

  let state: PetState = readPetState(storage)
  let drag: DragState | undefined
  let suppressClick = false
  let bubbleTimer: number | undefined
  let accountRequest = 0
  let hovered = false
  let visualStateOverride = visualStateFromLocation(win.location)
  let visualState: FirethornPetVisualState = 'default'

  const viewport = () => ({ width: win.innerWidth, height: win.innerHeight })
  const place = (): void => {
    const position = positionForDock(state, viewport())
    root.style.left = `${String(position.left)}px`
    root.style.top = `${String(position.top)}px`
    root.classList.toggle('is-left', state.side === 'left')
  }
  const stopBubbleTimer = (): void => {
    if (bubbleTimer !== undefined) win.clearTimeout(bubbleTimer)
    bubbleTimer = undefined
  }
  const hideBubble = (): void => {
    accountRequest += 1
    stopBubbleTimer()
    bubble.hidden = true
  }
  const showTaskNotice = (text: string): void => {
    accountRequest += 1
    stopBubbleTimer()
    bubble.classList.remove('is-account')
    bubble.textContent = text
    bubble.hidden = false
    bubbleTimer = win.setTimeout(hideBubble, TASK_NOTICE_MS)
  }
  const renderAccountError = (message: string): void => {
    bubble.classList.add('is-account')
    bubble.textContent = `积分：暂无\n余额：${message}`
    bubble.hidden = false
  }
  const loadAccount = async (): Promise<void> => {
    stopBubbleTimer()
    const request = ++accountRequest
    bubble.classList.add('is-account')
    bubble.textContent = '积分：加载中…\n余额：加载中…'
    bubble.hidden = false
    try {
      const fetchAccount = environment.accountFetch ?? ((input: string, init?: RequestInit) => win.fetch(input, init))
      if (typeof fetchAccount !== 'function') {
        renderAccountError('账户接口不可用')
        return
      }
      const response = await fetchAccount(FIRETHORN_PET_ACCOUNT_URL, { cache: 'no-store' })
      const payload = parseFirethornPetAccountResponse(await response.json() as unknown)
      if (request !== accountRequest) return
      if (payload === undefined) {
        renderAccountError('账户数据无效')
      } else if (!payload.ok) {
        renderAccountError(payload.code === 'NO_KEY' ? '未配置 API Key' : payload.error)
      } else {
        const points = payload.points === null ? '暂无' : String(payload.points)
        bubble.textContent = `积分：${points}\n余额：${payload.currency} ${payload.balance.toFixed(2)}`
      }
      bubbleTimer = win.setTimeout(hideBubble, ACCOUNT_MS)
    } catch {
      if (request !== accountRequest) return
      renderAccountError('暂时无法获取')
      bubbleTimer = win.setTimeout(hideBubble, ACCOUNT_MS)
    }
  }
  const persist = (): void => { writePetState(storage, state) }
  const updateVisualState = (): void => {
    const next = visualStateOverride ?? (hovered ? 'hover' : 'default')
    if (next === visualState && root.dataset.visualState === next
      && sprite.src.endsWith(FIRETHORN_PET_ASSET_URLS[next])) return
    visualState = next
    sprite.src = FIRETHORN_PET_ASSET_URLS[next]
    root.dataset.visualState = next
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return
    drag = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startLeft: Number.parseFloat(root.style.left),
      startTop: Number.parseFloat(root.style.top),
      moved: false,
    }
    root.classList.add('is-pressed')
  }
  const onPointerMove = (event: PointerEvent): void => {
    if (drag === undefined || drag.pointerId !== event.pointerId) return
    const dx = event.clientX - drag.startClientX
    const dy = event.clientY - drag.startClientY
    if (!drag.moved && dx * dx + dy * dy < CLICK_DISTANCE_SQ) return
    drag.moved = true
    root.classList.add('is-dragging')
    const size = BASE_SIZE
    root.style.left = `${String(clamp(drag.startLeft + dx, 0, Math.max(0, win.innerWidth - size)))}px`
    root.style.top = `${String(clamp(drag.startTop + dy, 0, Math.max(0, win.innerHeight - size)))}px`
    event.preventDefault()
  }
  const finishPointer = (event: PointerEvent): void => {
    if (drag === undefined || drag.pointerId !== event.pointerId) return
    root.classList.remove('is-pressed', 'is-dragging')
    if (drag.moved) {
      suppressClick = true
      state = {
        ...state,
        ...nearestDock(
          Number.parseFloat(root.style.left),
          Number.parseFloat(root.style.top),
          BASE_SIZE,
          viewport(),
        ),
      }
      place()
      persist()
    }
    drag = undefined
  }
  const onClick = (): void => {
    if (suppressClick) {
      suppressClick = false
      return
    }
    void loadAccount()
  }
  const onMouseEnter = (): void => {
    hovered = true
    updateVisualState()
  }
  const onMouseLeave = (): void => {
    hovered = false
    updateVisualState()
  }
  const onVisualState = (event: Event): void => {
    const requested = parsePetVisualState((event as CustomEvent<unknown>).detail)
    if (requested === undefined) return
    visualStateOverride = requested === 'default' ? undefined : requested
    updateVisualState()
  }
  const onTaskNotice = (event: Event): void => {
    const detail = (event as CustomEvent<unknown>).detail
    if (typeof detail !== 'object' || detail === null || Array.isArray(detail)) return
    const text = (detail as { text?: unknown }).text
    if (typeof text !== 'string' || text.trim() === '') return
    showTaskNotice(text)
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') hideBubble()
  }
  const onResize = (): void => { place() }
  const setVisible = (visible: boolean): void => {
    root.hidden = !visible
    if (!visible) hideBubble()
  }

  body.addEventListener('pointerdown', onPointerDown)
  body.addEventListener('click', onClick)
  body.addEventListener('keydown', onKeyDown)
  body.addEventListener('mouseenter', onMouseEnter)
  body.addEventListener('mouseleave', onMouseLeave)
  win.addEventListener(PET_VISUAL_STATE_EVENT, onVisualState)
  win.addEventListener(FIRETHORN_PET_TASK_EVENT, onTaskNotice)
  win.addEventListener('pointermove', onPointerMove)
  win.addEventListener('pointerup', finishPointer)
  win.addEventListener('pointercancel', finishPointer)
  win.addEventListener('resize', onResize)
  updateVisualState()
  place()

  const dispose = (): void => {
    hideBubble()
    body.removeEventListener('pointerdown', onPointerDown)
    body.removeEventListener('click', onClick)
    body.removeEventListener('keydown', onKeyDown)
    body.removeEventListener('mouseenter', onMouseEnter)
    body.removeEventListener('mouseleave', onMouseLeave)
    win.removeEventListener(PET_VISUAL_STATE_EVENT, onVisualState)
    win.removeEventListener(FIRETHORN_PET_TASK_EVENT, onTaskNotice)
    win.removeEventListener('pointermove', onPointerMove)
    win.removeEventListener('pointerup', finishPointer)
    win.removeEventListener('pointercancel', finishPointer)
    win.removeEventListener('resize', onResize)
    root.remove()
    style.remove()
  }
  dispose.setVisible = setVisible
  return dispose
}
