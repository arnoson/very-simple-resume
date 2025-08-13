import { finder } from '@medv/finder'
import type { ElementState, MaybeFunction, Page, Rule } from './types'
import { info, warn } from './log'

export const scrollingElements = new Set<Element>()

/** Save the current page's state. */
export const getPageState = (rules: Rule[]): Page => {
  const page: Page = {}

  // Collect state from elements matching rules
  for (const rule of rules) {
    const elements = document.querySelectorAll<HTMLElement>(rule.selector)
    for (const el of elements) {
      const state = getElementState(el, rule)
      if (!state) continue

      const selector = getUniqueSelector(el)
      page[selector] ??= {}
      page[selector] = mergeElementState(page[selector], state)
    }
  }

  // Collect scroll positions
  for (const el of scrollingElements) {
    if (el.scrollTop === 0 && el.scrollLeft === 0) continue
    const selector = getUniqueSelector(el)
    page[selector] ??= {}
    page[selector].scroll = { top: el.scrollTop, left: el.scrollLeft }
  }

  // Store focused element
  if (document.activeElement && document.activeElement !== document.body) {
    const focusedSelector = getUniqueSelector(document.activeElement)
    page[focusedSelector] ??= {}
    page[focusedSelector].focused = true
  }

  return page
}

/** Restore the current page's state. */
export const applyPageState = (page: Page) => {
  for (const [selector, state] of Object.entries(page)) {
    const el = document.querySelector<HTMLElement>(selector)
    if (!el) {
      warn(`No element found for selector '${selector}'`)
      continue
    }
    applyElementState(el, state)
  }
  info('Restored page state')
}

/** Extract state from an element based on the given rule */
const getElementState = (el: HTMLElement, rule: Rule): ElementState => {
  const resolveGetter = (arg: MaybeFunction<string[] | undefined>) =>
    typeof arg === 'function' ? arg(el) : arg

  const state: ElementState = {}
  for (const name of resolveGetter(rule.attributes) ?? []) {
    const value = el.getAttribute(name)
    if (!value) continue
    state.attributes ??= {}
    state.attributes[name] = value
  }

  for (const name of resolveGetter(rule.properties) ?? []) {
    const value = (el as any)[name]
    if (!value) continue
    state.properties ??= {}
    state.properties[name] = value
  }

  for (const name of resolveGetter(rule.dataset) ?? []) {
    const value = el.dataset[name]
    if (!value) continue
    state.dataset ??= {}
    state.dataset[name] = value
  }

  return state
}

/** Apply stored state to an element */
const applyElementState = (el: HTMLElement, state: ElementState) => {
  const { attributes = {}, properties = {}, dataset = {} } = state

  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value)
  }

  for (const [name, value] of Object.entries(properties)) {
    ;(el as any)[name] = value
  }

  for (const [name, value] of Object.entries(dataset)) {
    el.dataset[name] = value
  }

  if (state.scroll) {
    // Timeout seems to be necessary for the element to be ready.
    setTimeout(() => el.scrollTo(state.scroll))
  }

  if (state.focused) {
    // Timeout seems to be necessary for the element to be ready.
    setTimeout(() => el.focus())
  }
}

/** Get a unique CSS selector for an element */
const getUniqueSelector = (el: Element) => finder(el)

/** Merge two element states together */
const mergeElementState = (
  target: ElementState,
  source: ElementState
): ElementState => ({
  attributes: { ...target.attributes, ...source.attributes },
  properties: { ...target.properties, ...source.properties },
  dataset: { ...target.dataset, ...source.dataset },
  scroll: source.scroll ?? target.scroll,
  focused: source.focused ?? target.focused,
})
