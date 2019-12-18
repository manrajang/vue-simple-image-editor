<template>
  <div>
    <simple-menu />
    <simple-canvas style="border: 1px solid red;" />
  </div>
</template>

<script>
import SimpleMenu from '@/components/Menu'
import SimpleCanvas from '@/components/SimpleCanvas'

export default {
  name: 'app',
  components: {
    SimpleMenu,
    SimpleCanvas
  }
}
</script>
