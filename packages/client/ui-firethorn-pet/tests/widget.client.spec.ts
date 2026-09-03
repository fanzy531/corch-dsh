// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FIRETHORN_PET_ASSET_URL, FIRETHORN_PET_ASSET_URLS, FIRETHORN_PET_TASK_EVENT,
} from '../src/shared.ts'
import { PET_STATE_KEY } from '../src/client/state.ts'
import { PET_VISUAL_STATE_EVENT } from '../src/client/visual-state.ts'
import { mountFirethornPet } from '../src/client/widget.ts'

function pointer(
  type: string,
  { id = 1, x = 0, y = 0, button = 0 }: { id?: number; x?: number; y?: number; button?: number } = {},
): PointerEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button })
  Object.defineProperty(event, 'pointerId', { value: id })
  return event as PointerEvent
}

function body(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('.firethorn-pet__body')!
}

beforeEach(() => {
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  localStorage.clear()
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('firethorn pet browser widget', () => {
  it('keeps the bubble hidden until a task notice, opens account data on click, and disposes completely', async () => {
    vi.useFakeTimers()
    const accountFetch = vi.fn(async () => ({
      json: async () => ({ ok: true, points: 12, balance: 3.5, currency: 'CNY', updatedAt: 'now' }),
    } as Response))
    const dispose = mountFirethornPet({ document, window, storage: localStorage, accountFetch })
    const root = document.querySelector<HTMLElement>('.firethorn-pet')!
    const bubble = document.querySelector<HTMLElement>('.firethorn-pet__bubble')!
    expect(root.style.left).toBe('644px')
    expect(root.style.top).toBe('444px')
    expect(document.querySelector<HTMLImageElement>('img')?.getAttribute('src')).toBe(FIRETHORN_PET_ASSET_URL)
    expect(document.querySelector('style[data-firethorn-pet]')).not.toBeNull()

    expect(bubble.hidden).toBe(true)
    window.dispatchEvent(new CustomEvent(FIRETHORN_PET_TASK_EVENT, {
      detail: { text: '处理中\n整理本周课程资料' },
    }))
    expect(bubble.hidden).toBe(false)
    expect(bubble.textContent).toBe('处理中\n整理本周课程资料')
    vi.advanceTimersByTime(5_000)
    expect(bubble.hidden).toBe(true)
    body().click()
    await Promise.resolve()
    await Promise.resolve()
    expect(accountFetch).toHaveBeenCalledWith('/firethorn-pet/account.json', { cache: 'no-store' })
    expect(bubble.textContent).toBe('积分：12\n余额：CNY 3.50')
    body().click()
    await Promise.resolve()
    await Promise.resolve()
    expect(accountFetch).toHaveBeenCalledTimes(2)
    expect(bubble.textContent).toBe('积分：12\n余额：CNY 3.50')
    body().dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    expect(bubble.hidden).toBe(true)

    dispose()
    expect(document.querySelector('[data-firethorn-pet]')).toBeNull()
  })

  it('switches to the hover sprite and supports manual working and exhausted previews', () => {
    const dispose = mountFirethornPet({ document, window, storage: localStorage })
    const root = document.querySelector<HTMLElement>('.firethorn-pet')!
    const sprite = root.querySelector<HTMLImageElement>('.firethorn-pet__sprite')!
    body().dispatchEvent(new MouseEvent('mouseenter'))
    expect(sprite.src).toContain(FIRETHORN_PET_ASSET_URLS.hover)
    expect(root.dataset.visualState).toBe('hover')
    body().dispatchEvent(new MouseEvent('mouseleave'))
    expect(sprite.src).toContain(FIRETHORN_PET_ASSET_URLS.default)

    window.dispatchEvent(new CustomEvent(PET_VISUAL_STATE_EVENT, { detail: 'working' }))
    expect(sprite.src).toContain(FIRETHORN_PET_ASSET_URLS.working)
    window.dispatchEvent(new CustomEvent(PET_VISUAL_STATE_EVENT, { detail: 'exhausted' }))
    expect(sprite.src).toContain(FIRETHORN_PET_ASSET_URLS.exhausted)
    window.dispatchEvent(new CustomEvent(PET_VISUAL_STATE_EVENT, { detail: 'default' }))
    expect(sprite.src).toContain(FIRETHORN_PET_ASSET_URLS.default)
    dispose()
  })

  it('keeps a fixed size and repositions on resize', () => {
    const dispose = mountFirethornPet({ document, window, storage: localStorage })
    const root = document.querySelector<HTMLElement>('.firethorn-pet')!
    expect(root.querySelectorAll('button')).toHaveLength(1)
    expect(localStorage.getItem(PET_STATE_KEY)).toBeNull()

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 900 })
    window.dispatchEvent(new Event('resize'))
    expect(document.querySelector<HTMLElement>('.firethorn-pet')!.style.left).toBe('744px')
    dispose()
  })

  it('starts hidden when disabled and can be shown without remounting', () => {
    const dispose = mountFirethornPet({ document, window, storage: localStorage, visible: false })
    const root = document.querySelector<HTMLElement>('.firethorn-pet')!
    const bubble = document.querySelector<HTMLElement>('.firethorn-pet__bubble')!
    expect(root.hidden).toBe(true)
    dispose.setVisible(true)
    expect(root.hidden).toBe(false)
    window.dispatchEvent(new CustomEvent(FIRETHORN_PET_TASK_EVENT, { detail: { text: '任务' } }))
    expect(bubble.hidden).toBe(false)
    dispose.setVisible(false)
    expect(root.hidden).toBe(true)
    expect(bubble.hidden).toBe(true)
    dispose()
  })

  it('drags, docks, flips on the left, and suppresses the release click', () => {
    const dispose = mountFirethornPet({ document, window, storage: localStorage })
    const root = document.querySelector<HTMLElement>('.firethorn-pet')!
    const bubble = document.querySelector<HTMLElement>('.firethorn-pet__bubble')!

    body().dispatchEvent(pointer('pointerdown', { button: 1, x: 700, y: 500 }))
    expect(root.classList.contains('is-pressed')).toBe(false)
    body().dispatchEvent(pointer('pointerdown', { x: 700, y: 500 }))
    window.dispatchEvent(pointer('pointermove', { id: 2, x: 100, y: 200 }))
    window.dispatchEvent(pointer('pointermove', { x: 701, y: 501 }))
    expect(root.classList.contains('is-dragging')).toBe(false)
    window.dispatchEvent(pointer('pointermove', { x: 20, y: 220 }))
    expect(root.classList.contains('is-dragging')).toBe(true)
    window.dispatchEvent(pointer('pointerup', { id: 2, x: 20, y: 220 }))
    expect(root.classList.contains('is-dragging')).toBe(true)
    window.dispatchEvent(pointer('pointerup', { x: 20, y: 220 }))
    expect(root.classList.contains('is-left')).toBe(true)
    expect(JSON.parse(localStorage.getItem(PET_STATE_KEY)!)).toMatchObject({ side: 'left' })

    body().click()
    expect(bubble.hidden).toBe(true)
    body().click()
    expect(bubble.hidden).toBe(false)
    dispose()
  })

  it('handles a non-drag release and pointer cancellation without persisting a dock change', () => {
    const dispose = mountFirethornPet({ document, window, storage: undefined })
    const root = document.querySelector<HTMLElement>('.firethorn-pet')!
    body().dispatchEvent(pointer('pointerdown', { x: 700, y: 500 }))
    window.dispatchEvent(pointer('pointerup', { x: 700, y: 500 }))
    expect(root.classList.contains('is-pressed')).toBe(false)

    body().dispatchEvent(pointer('pointerdown', { x: 700, y: 500 }))
    window.dispatchEvent(pointer('pointercancel', { x: 700, y: 500 }))
    expect(root.classList.contains('is-pressed')).toBe(false)
    dispose()
  })
})
