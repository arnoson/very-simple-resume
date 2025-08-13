import type { SimpleElement } from '@very-simple/components'
import type { Rule } from './types'

export const rules: Rule[] = [
  {
    selector: 'input:not([type=radio]):not([type=checkbox]):not([type=file])',
    properties: ['value'],
  },
  {
    selector: 'input[type=radio], input[type=checkbox]',
    properties: ['checked'],
  },
  {
    selector: 'textarea',
    properties: ['value'],
  },
  {
    selector: 'select',
    properties: ['value'],
  },
  {
    selector: 'details, dialog',
    properties: ['open'],
  },
  {
    selector: '[aria-selected]',
    attributes: ['aria-selected'],
  },
  {
    selector: '[data-simple-component]',
    dataset: (el) => {
      const simpleEl = el as SimpleElement<any>
      if (!simpleEl.$options.props) return
      return Object.keys(simpleEl.$options.props)
    },
  },
]
