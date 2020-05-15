<template>
  <div>
    <button type="button" @click="onClickResize">리사이즈</button>
    <button type="button" @click="onClickCrop">크롭</button>
    <button type="button" @click="onClickSave">저장</button>
    <simple-canvas ref="simpleCanvas" style="border: 1px solid red;" :width="1000" :height="1000" :isCrop="isCrop" :imageSrc="'img/a.png'" />
  </div>
</template>

<script>
import SimpleCanvas from '@/components/SimpleCanvas'

export default {
  name: 'app',
  components: {
    SimpleCanvas
  },
  data () {
    return {
      isCrop: false
    }
  },
  methods: {
    onClickResize () {
      this.isCrop = false
    },
    onClickCrop () {
      this.isCrop = true
    },
    onClickSave () {
      this.$refs.simpleCanvas.saveImageFile()
    }
  }
}
</script>
