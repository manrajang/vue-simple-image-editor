<template>
  <div>
    <button type="button">리사이즈</button>
    <button type="button">크롭</button>
    <simple-canvas style="border: 1px solid red;" :width="1000" :height="1000" :imageSrc="'img/a.png'" />
  </div>
</template>

<script>
import SimpleCanvas from '@/components/SimpleCanvas'

export default {
  name: 'app',
  components: {
    SimpleCanvas
  }
}
</script>
