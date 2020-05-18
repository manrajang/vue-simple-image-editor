<template>
  <div :style="{ width: `${width}px`, height: `${height}px` }" class="container" ref="container" style="position:relative;">
    <canvas
      :height="height"
      :width="width"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      id="viewCanvas"
      ref="viewCanvas"
    ></canvas>
    <canvas
      v-show="isCrop"
      class="crop-canvas"
      :height="height"
      :width="width"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      id="cropCanvas"
      ref="cropCanvas"
      style="position:absolute;left:0;top:0;"
    ></canvas>
    <template v-if="isMultiMode">
      <button v-if="isCrop" style="position:absolute;right:0;top:0;" type="button" :style="cropSaveButtonStyle" @click="onClickCrop">{{ cropSaveButtonText }}</button>
      <button v-else style="position:absolute;right:0;top:0;" type="button" :style="cropButtonStyle" @click="isCrop = true">{{ cropButtonText }}</button>
    </template>
  </div>
</template>

<script>
import ImageView from '@/view/ImageView'
import ResizeView from '@/view/ResizeView'
import CropView from '@/view/CropView'
import { HANDLER_POS, EDIT_MODE } from '@/constants'

const DEFAULT_RESIZE_HANDLER_STYLE = {
  strokeColor: '#FF0000',
  strokeWidth: 2,
  handlerFillColor: '#FF0000',
  handlerSize: 7,
}
const DEFAULT_CROP_HANDLER_STYLE = {
  strokeColor: '#FF0000',
  strokeWidth: 2,
  handlerFillColor: '#FF0000',
  handlerSize: 7,
  fillColor: '#C0C0C0',
  fillAlpha: 0.3,
}

function loadImage (src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export default {
  props: {
    width: { type: Number, default: 500 },
    height: { type: Number, default: 500 },
    imageSrc: { type: String, default: null },
    imageObj: { type: Image, default: null },
    isResizeMode: { type: Boolean, default: false },
    isCropMode: { type: Boolean, defaul: false },
    resizeHandlerStyle: { type: Object, default: () => ({}) },
    cropHandlerStyle: { type: Object, default: () => ({}) },
    cropButtonText: { type: String, default: 'Crop' },
    cropButtonStyle: { type: Object, default: null },
    cropSaveButtonText: { type: String, default: 'Save Crop' },
    cropSaveButtonStyle: { type: Object, default: null },
    fixedCropWidth: { type: Number, default: 0 },
    fixedCropHeight: { type: Number, default: 0 },
  },
  data () {
    return {
      isCrop: null,
      imageView: null,
      resizeView: null,
      cropView: null,
      image: null,
      editMode: EDIT_MODE.NONE,
      isDrawing: false,
      prevPos: null,
    }
  },
  computed: {
    isMultiMode () {
      return !(this.isResizeMode ^ this.isCropMode)
    },
    trackerView () {
      return this.isCrop ? this.cropView : this.resizeView
    }
  },
  watch: {
    imageSrc: {
      immediate: true,
      handler (value) {
        if (value) {
          loadImage(value).then(image => this.image = image)
        } else {
          this.image = null
        }
      }
    },
    isCropMode: {
      immediate: true,
      handler (value) {
        this.isCrop = value
      }
    },
    isCrop (value) {
      this.render()
      this.$emit('changeCropMode', value)
    },
    imageObj: {
      immediate: true,
      handler (value) {
        if (value) {
          loadImage(value.src).then(image => this.image = image)
        } else {
          this.image = value
        }
      }
    },
    image (value) {
      if (value) {
        const { width, height } = value
        let x = (this.width - width) / 2
        let y = (this.height - height) / 2
        const bounds = { left: x, top: y, right: x + width, bottom: y + height }
        this.imageView.bounds = bounds
        this.resizeView.bounds = { ...bounds }
        this.resizeView.boundaryBounds = { left: 0, top: 0, right: this.width, bottom: this.height }
        if (this.fixedCropWidth && this.fixedCropHeight && this.fixedCropWidth < width && this.fixedCropHeight < height) {
          x = (this.width - this.fixedCropWidth) / 2
          y = (this.height - this.fixedCropHeight) / 2
          this.cropView.isFixedCrop = true
          this.cropView.bounds = { left: x, top: y, right: x + this.fixedCropWidth, bottom: y + this.fixedCropHeight }
        } else {
          this.cropView.bounds = { ...bounds }
        }
        this.cropView.boundaryBounds = { ...bounds }
        this.imageView.image = value
        this.render()
      } else {
        this.imageView.bounds = null
        this.resizeView.bounds = null
        this.resizeView.boundaryBounds = null
        this.cropView.bounds = null
        this.cropView.boundaryBounds = null
      }
    },
  },
  created () {
    window.addEventListener('mouseup', this.onDocumentMouseUp)
  },
  mounted () {
    if (!this.imageView) {
      this.imageView = new ImageView(this.$refs.viewCanvas)
    }
    if (!this.resizeView) {
      this.resizeView = new ResizeView(this.$refs.viewCanvas, { ...DEFAULT_RESIZE_HANDLER_STYLE, ...this.resizeHandlerStyle })
    }
    if (!this.cropView) {
      this.cropView = new CropView(this.$refs.cropCanvas, { ...DEFAULT_CROP_HANDLER_STYLE, ...this.cropHandlerStyle })
    }
  },
  destroyed () {
    window.removeEventListener('mouseup', this.onDocumentMouseUp)
  },
  methods: {
    getPos ({ pageX, pageY }) {
      const { offsetLeft, offsetTop } = this.$refs.container
      return { x: pageX - offsetLeft, y: pageY - offsetTop }
    },
    updateBounds () {
      if (!this.isCrop) {
        const bounds = { ...this.trackerView.bounds }
        this.imageView.bounds = bounds
        this.cropView.bounds = { ...bounds }
        this.cropView.boundaryBounds = { ...bounds }
      }
    },
    render () {
      if (!this.isDrawing) {
        window.requestAnimationFrame(() => {
          this.imageView.draw()
          this.trackerView.draw()
          this.isDrawing = false
        })
        this.isDrawing = true
      }
    },
    finishEdit () {
      if (this.editMode !== EDIT_MODE.NONE) {
        if (!this.isCrop && this.editMode === EDIT_MODE.RESIZE) {
          this.resize()
        }
        this.resizeView.mode = null
        this.cropView.mode = null
        this.editMode = EDIT_MODE.NONE
      }
    },
    onMouseDown (event) {
      const curPos = this.getPos(event)
      this.trackerView.setMode(curPos)
      const { mode } = this.trackerView
      this.editMode = mode == null ? EDIT_MODE.NONE : (mode === HANDLER_POS.MOVE ? EDIT_MODE.MOVE : EDIT_MODE.RESIZE)
      this.prevPos = curPos
    },
    onMouseMove (event) {
      if (this.editMode !== EDIT_MODE.NONE) {
        const curPos = this.getPos(event)
        if (this.editMode === EDIT_MODE.RESIZE) {
          this.trackerView.changeResizeBounds(curPos)
        } else if (this.editMode === EDIT_MODE.MOVE) {
          this.trackerView.changeMoveBounds(curPos, this.prevPos)
        }
        this.updateBounds()
        this.render()
        this.prevPos = curPos
      }
    },
    onMouseUp (event) {
      this.finishEdit()
    },
    onDocumentMouseUp (event) {
      this.finishEdit()
    },
    onClickCrop () {
      this.isCrop = false
      this.crop()
    },
    saveImageFile (fileName) {
      this.imageView.saveFile(fileName)
    },
    resize () {
      this.imageView.resize()
      this.$emit('changeImage', this.getImage())
    },
    crop () {
      const bounds = { ...this.cropView.bounds }
      this.imageView.crop(bounds)
      this.resizeView.bounds = { ...bounds }
      this.cropView.boundaryBounds = { ...bounds }
      this.render()
      this.$emit('changeImage', this.getImage())
    },
    getImage () {
      return this.imageView.image
    },
  }
}
</script>
