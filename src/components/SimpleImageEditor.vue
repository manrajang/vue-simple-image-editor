<template>
  <div>
    <template v-if="isMultiMode">
      <template v-if="isCrop" >
        <div style="position:absolute;right:0;top:0;">
          <button type="button" :style="cropSaveButtonStyle" @click="onClickCrop">{{ cropSaveButtonText }}</button>
          <button style="margin-left:10px;" type="button" :style="cropCancelButtonStyle" @click="isCrop = false">{{ cropCancelButtonText }}</button>
        </div>
      </template>
      <button v-else style="position:absolute;right:0;top:0;" type="button" :style="cropButtonStyle" @click="isCrop = true">{{ cropButtonText }}</button>
    </template>
  </div>
</template>

<script>
import ImageEditor from '@/view/ImageEditor'

export default {
  props: {
    width: { type: Number, default: 500, required: true },
    height: { type: Number, default: 500, required: true },
    imageSrc: { type: String, default: null },
    imageObj: { type: Image, default: null },
    isResizeMode: { type: Boolean, default: false },
    isCropMode: { type: Boolean, defaul: false },
    isFixedCrop: { type: Boolean, defaul: false },
    resizeHandlerStyle: { type: Object, default: () => ({}) },
    cropHandlerStyle: { type: Object, default: () => ({}) },
    cropButtonText: { type: String, default: 'Crop' },
    cropButtonStyle: { type: Object, default: null },
    cropSaveButtonText: { type: String, default: 'Save Crop' },
    cropSaveButtonStyle: { type: Object, default: null },
    cropCancelButtonText: { type: String, default: 'Cancel Crop' },
    cropCancelButtonStyle: { type: Object, default: null },
    cropWidth: { type: Number, default: 0 },
    cropHeight: { type: Number, default: 0 },
  },
  data () {
    return {
      isCrop: null,
      imageEditor: null,
    }
  },
  computed: {
    isMultiMode () {
      return !(this.isResizeMode ^ this.isCropMode)
    },
  },
  watch: {
    imageSrc (value) {
      if (this.imageEditor) {
        this.imageEditor.setImagePath(value)
      }
    },
    imageObj (value) {
      if (this.imageEditor) {
        this.imageEditor.setImagePath(value ? value.src : null)
      }
    },
    isCropMode (value) {
      this.isCrop = value
    },
    isFixedCrop (value) {
      this.imageEditor.setFixedCrop(value)
    },
    isCrop (value) {
      this.imageEditor.setCrop(value)
    },
  },
  mounted () {
    if (!this.imageEditor) {
      this.imageEditor = new ImageEditor(this.$el, { width: this.width, height: this.height, cropWidth: this.cropWidth, cropHeight: this.cropHeight })
    }
    this.imageEditor.init()
    this.imageEditor.setImagePath(this.imageSrc || (this.imageObj && this.imageObj.src))
    this.imageEditor.setFixedCrop(this.isFixedCrop)
    this.imageEditor.setStyle(this.resizeHandlerStyle, this.cropHandlerStyle)
    this.isCrop = this.isCropMode
  },
  methods: {
    async onClickCrop () {
      await this.imageEditor.resize()
      await this.imageEditor.crop()
      this.isCrop = false
    },
    saveImageFile (fileName) {
      this.imageEditor.saveImageFile(fileName)
    },
    async resize () {
      await this.imageEditor.resize()
      this.$emit('changeImage', this.imageEditor.getImage())
    },
    async crop () {
      await this.imageEditor.crop()
      this.imageEditor.render()
      this.$emit('changeImage', this.imageEditor.getImage())
    },
  }
}
</script>
