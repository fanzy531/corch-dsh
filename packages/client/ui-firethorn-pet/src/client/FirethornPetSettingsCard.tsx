/** Settings card for the firethorn pet visibility preference. */

import { useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { FirethornPetSettingsCardFace } from './firethorn-pet-settings-controller.ts'
import css from './FirethornPetSettingsCard.module.css'

/** Props supplied by the plugin settings keyed slot. */
export type FirethornPetSettingsCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'settings.firethornPet'>
  & InjectFace<FirethornPetSettingsCardFace>

/** Render the feature-owned firethorn visibility card. */
export function FirethornPetSettingsCard(props: FirethornPetSettingsCardProps) {
  const state = props.useFirethornPetCard(snapshot => snapshot)
  const [open, setOpen] = useState(false)
  if (!state.available) return null
  const blocked = !state.dirty || state.saving || !state.writable
  return (
    <li className={css.card}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.headText}>
          <span className={css.name}>{props.t('title')}</span>
          <span className={css.description}>{props.t('description')}</span>
        </span>
        {state.dirty ? <span className={css.pending}>{props.t('unsaved')}</span> : null}
        <span className={css.chevron} aria-hidden="true">{open ? '⌃' : '⌄'}</span>
      </button>
      {open ? (
        <div className={css.body}>
          {!state.writable ? <p className={css.readOnly} role="status">{props.t('readOnly')}</p> : null}
          <label className={css.toggle}>
            <input
              type="checkbox"
              checked={state.enabled}
              disabled={!state.writable || state.saving}
              onChange={(event) => { props.setEnabled(event.currentTarget.checked) }}
            />
            <span className={css.toggleText}>
              <span className={css.label}>{props.t('enabled')}</span>
              <span className={css.hint}>{props.t('enabledHint')}</span>
            </span>
          </label>
          {state.overridden ? (
            <button type="button" className={css.reset} disabled={!state.writable || state.saving} onClick={props.reset}>
              {props.t('reset')}
            </button>
          ) : null}
          <div className={css.footer}>
            {state.failed ? <p className={css.failed} role="status">{props.t('saveFailed')}</p> : null}
            <button type="button" className={css.discard} disabled={!state.dirty || state.saving} onClick={props.discard}>
              {props.t('discard')}
            </button>
            <button type="button" className={css.save} disabled={blocked} onClick={props.save}>
              {props.t(state.saving ? 'saving' : 'save')}
            </button>
          </div>
        </div>
      ) : null}
    </li>
  )
}
