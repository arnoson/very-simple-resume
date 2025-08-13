import { info, warn } from './log'
import { rules as defaultRules } from './rules'
import { applyPageState, getPageState, scrollingElements } from './state'
import type { Page, Rule } from './types'
export { defaultRules }

let rules = defaultRules

const storagePrefix = 'very-simple-resume'
const getStorageKey = () => `${storagePrefix}:page-${window.location.pathname}`

/** Save the current page's state and resume from here after reloading.*/
export const resumeFromHere = () => {
  if (isAutoResumeEnabled()) {
    autoResume(false)
    warn(`Auto-resume was disabled to prevent overwriting the current state`)
  }

  const page = getPageState(rules)
  localStorage.setItem(getStorageKey(), JSON.stringify(page))
  info('Saved state')
}

/** Clear the current page's state. */
export const clearResume = () => {
  if (isAutoResumeEnabled()) {
    autoResume(false)
    warn(`Auto-resume was disabled to prevent overwriting the cleared state`)
  }
  localStorage.removeItem(getStorageKey())
}

/** Clear all state. */
export const clearAllResume = () => {
  if (isAutoResumeEnabled()) {
    autoResume(false)
    warn(`Auto-resume was disabled to prevent overwriting the cleared state`)
  }
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(`${storagePrefix}:page-`)) localStorage.removeItem(key)
  }
}

/** Toggle wether or to always resume from the last state before reloading. */
export const autoResume = (force?: boolean) => {
  const state = force ?? !isAutoResumeEnabled()
  localStorage.setItem(`${storagePrefix}:auto-resume`, `${state}`)

  if (state) window.addEventListener('beforeunload', handleBeforeUnload)
  else window.removeEventListener('beforeunload', handleBeforeUnload)

  info(`Auto-resume is ${state ? 'on' : 'off'}`)
}

const handleBeforeUnload = () => {
  const page = getPageState(rules)
  localStorage.setItem(getStorageKey(), JSON.stringify(page))
}

const isAutoResumeEnabled = (): boolean =>
  localStorage.getItem(`${storagePrefix}:auto-resume`) === 'true'

export type ResumeOptions = { auto: boolean; rules?: Rule[] }
export const initResume = (options: ResumeOptions = { auto: false }) => {
  if (options.rules) rules = options.rules

  const isReload = window.performance
    .getEntriesByType('navigation')
    .some((entry) => (entry as PerformanceNavigationTiming).type === 'reload')

  if (isReload) {
    const raw = localStorage.getItem(getStorageKey())
    if (raw) {
      const page: Page = JSON.parse(raw)
      applyPageState(page)
      info('Restored state')
    }
    if (isAutoResumeEnabled()) autoResume(true)
  } else {
    autoResume(options.auto)
    clearAllResume()
  }

  const scroll = (e: Event) => {
    if (e.target instanceof Document) {
      scrollingElements.add(document.documentElement)
    } else if (e.target instanceof Element) {
      scrollingElements.add(e.target)
    }
  }
  window.addEventListener('scroll', scroll, { capture: true, passive: true })
}

// Expose to window for usage in browser console.
declare global {
  interface Window {
    resumeFromHere: typeof resumeFromHere
    clearResume: typeof clearResume
    clearAllResume: typeof clearAllResume
    autoResume: typeof autoResume
  }
}
window.resumeFromHere = resumeFromHere
window.clearResume = clearResume
window.clearAllResume = clearAllResume
window.autoResume = autoResume
