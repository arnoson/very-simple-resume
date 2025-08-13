# 🔖 Very Simple Resume

Resume working on a page, exactly where you left off before reloading. Useful when working on a form (where you would have to fill in the required fields over and over again) or inside a dialog (that needs to stay open until you're done). This is intended as a development tool, not a production library.

## Setup

```js
// Assuming you are using Vite:
if (import.meta.env.DEV) {
  const { initResume } = await import('@very-simple/resume')
  initResume()
}
```

## Commands

Run these commands directly in the browser's console:

```js
// Save the current page's state and resume from here after reloading.
resumeFromHere()

// Toggle wether or to always resume from the last state before reloading.
autoResume()

// As soon as you visit your website manually (not thru a reload), all saved
// state and the auto-resume option is reset. If you want to clean up manually
// use these helper:
clearResume() // Only current page
clearAllResume() // All pages
```

## What is Resumed

Scroll positions and focused elements are always resumed, along with various DOM element states. See [`src/rules.ts`](./src/rules.ts) for the default rules.

You can also define your own:

```js
const rules = [
  {
    selector: '.my-class',
    attributes: ['aria-expanded'],
    properties: ['checked', 'value'],
    dataset: ['customKey'],
  },
]

// Either replace the default rules
initResume({ rules })

// Or extend the existing ones
import { defaultRules } from '@very-simple/resume'
initResume({ rules: [...defaultRules, ...rules] })
```

## Always Auto Resume

By default, auto-resume is disabled to avoid interfering with your workflow. You need to manually enable it each session. If you always want to auto-resume by default, enable the `auto` option:

```js
initResume({ auto: true })
```
