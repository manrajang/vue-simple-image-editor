import SimpleImageEditor from '@/components/SimpleImageEditor'

export default function install (Vue) {
  if (install.installed) {
    return
  }
  install.installed = true
  Vue.component('simple-image-editor', SimpleImageEditor)
}

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use({ install })
}

export { SimpleImageEditor }
