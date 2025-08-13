import {
  defineOptions,
  mountComponents,
  registerComponent,
} from '@very-simple/components'

const options = defineOptions({
  el: HTMLDialogElement,
  props: { open: false },
})
registerComponent('dialog', options, ({ el, props }) => {
  if (props.open) el.showModal()

  el.addEventListener('close', () => (props.open = false))

  const open = () => {
    el.showModal()
    props.open = true
  }

  const close = () => {
    el.close()
    props.open = false
  }

  return { open, close }
})

if (import.meta.env.DEV) {
  const { initResume } = await import('.')
  initResume()
}

mountComponents()
