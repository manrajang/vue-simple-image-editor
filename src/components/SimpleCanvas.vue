<template>
  <div :style="{ width: `${width}px`, height: `${height}px` }" class="container" ref="container">
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
    ></canvas>
  </div>
</template>

<script>
import ImageView from '@/view/ImageView'
import ResizeView from '@/view/ResizeView'
import CropView from '@/view/CropView'
import { HANDLER_POS, EDIT_MODE } from '@/constants'

const HANDLER_SIZE = 10

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
    isCrop: { type: Boolean, defaul: false },
    imageSrc: { type: String, default: null },
    imageObj: { type: Object, default: null },
    handlerSize: { type: Number, default: 10 }
  },
  data () {
    return {
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
    trackerView () {
      return this.isCrop ? this.cropView : this.resizeView
    }
  },
  watch: {
    isCrop: {
      immediate: true,
      handler () {
        this.render()
      }
    },
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
    imageObj: {
      immediate: true,
      handler (value) {
        this.image = value
      }
    },
    image (value) {
      if (value) {
        const { width, height } = value
        const x = (this.width - width) / 2
        const y = (this.height - height) / 2
        const bounds = { left: x, top: y, right: x + width, bottom: y + height }
        this.imageView.bounds = bounds
        this.resizeView.bounds = { ...bounds }
        this.resizeView.boundaryBounds = { left: 0, top: 0, right: this.width, bottom: this.height }
        this.cropView.bounds = { ...bounds }
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
      this.resizeView = new ResizeView(this.$refs.viewCanvas, this.handlerSize)
    }
    if (!this.cropView) {
      this.cropView = new CropView(this.$refs.cropCanvas, this.handlerSize)
    }
  },
  destroyed () {
    window.removeEventListener('mouseup', this.onDocumentMouseUp)
  },
  methods: {
    finishEdit () {
      if (this.editMode !== EDIT_MODE.NONE) {
        if (!this.isCrop && this.editMode === EDIT_MODE.RESIZE) {
          this.imageView.resize()
        }
        this.resizeView.mode = null
        this.cropView.mode = null
        this.editMode = EDIT_MODE.NONE
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
    onMouseDown (event) {
      const curPos = this.getPos(event)
      this.trackerView.setMode(curPos)
      const { mode } = this.trackerView
      this.editMode = mode == null ? EDIT_MODE.NONE : (mode === HANDLER_POS.MOVE ? EDIT_MODE.MOVE : EDIT_MODE.RESIZE)
      this.prevPos = curPos
    },
    updateBounds () {
      if (!this.isCrop) {
        const bounds = { ...this.trackerView.bounds }
        this.imageView.bounds = bounds
        this.cropView.bounds = { ...bounds }
        this.cropView.boundaryBounds = { ...bounds }
      }
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
    getPos ({ pageX, pageY }) {
      const { offsetLeft, offsetTop } = this.$refs.container
      return { x: pageX - offsetLeft, y: pageY - offsetTop }
    },
    saveImageFile () {
      this.imageView.saveFile()
    },
    crop () {
      const bounds = { ...this.cropView.bounds }
      this.imageView.crop(bounds)
      this.resizeView.bounds = { ...bounds }
      this.cropView.boundaryBounds = { ...bounds }
      this.render()
    },
  }
}
</script>

<style scope lang='scss'>
  .container {
    position: relative;
    .crop-canvas {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
</style>
