<template>
  <div :style="{ width: `${width}px`, height: `${height}px` }" class="container" ref="container" style="position:relative;transform:">
    <canvas
      :height="height"
      :width="width"
      @mousedown.stop="onMouseDown"
      @mousemove.stop="onMouseMove"
      @mouseup.stop="onMouseUp"
      @touchstart.prevent="onMouseDown"
      @touchmove.prevent="onMouseMove"
      @touchend.prevent="onMouseUp"
      id="viewCanvas"
      ref="viewCanvas"
    ></canvas>
    <canvas
      v-show="isCrop"
      class="crop-canvas"
      :height="height"
      :width="width"
      @mousedown.stop="onMouseDown"
      @mousemove.stop="onMouseMove"
      @mouseup.stop="onMouseUp"
      @touchstart.prevent="onMouseDown"
      @touchmove.prevent="onMouseMove"
      @touchend.prevent="onMouseUp"
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
    isFixedCrop: { type: Boolean, defaul: false },
    resizeHandlerStyle: { type: Object, default: () => ({}) },
    cropHandlerStyle: { type: Object, default: () => ({}) },
    cropButtonText: { type: String, default: 'Crop' },
    cropButtonStyle: { type: Object, default: null },
    cropSaveButtonText: { type: String, default: 'Save Crop' },
    cropSaveButtonStyle: { type: Object, default: null },
    cropWidth: { type: Number, default: 0 },
    cropHeight: { type: Number, default: 0 },
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
          this.setImage(value)
        } else {
          this.image = null
        }
      }
    },
    imageObj: {
      immediate: true,
      handler (value) {
        if (value) {
          this.setImage(value.src)
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
    isFixedCrop (value) {
      this.cropView.isFixedCrop = value
      this.render()
    },
    isCrop (value) {
      this.render()
      this.$emit('changeCropMode', value)
    },
    image (value) {
      this.imageView.image = value
      if (value) {
        const { width, height } = value
        const x = (this.width - width) / 2
        const y = (this.height - height) / 2
        const bounds = { left: x, top: y, right: x + width, bottom: y + height, angle: 45 }
        let cropBounds = bounds
        if (this.cropWidth && this.cropHeight && this.cropWidth < width && this.cropHeight < height) {
          const x = (this.width - this.cropWidth) / 2
          const y = (this.height - this.cropHeight) / 2
          cropBounds = { left: x, top: y, right: x + this.cropWidth, bottom: y + this.cropHeight }
        }
        this.imageView.setBounds(bounds)
        this.resizeView.setBounds(bounds)
        this.cropView.setBounds(cropBounds)
        this.cropView.isFixedCrop = this.isFixedCrop
        this.render()
      } else {
        this.imageView.setBounds(null)
        this.resizeView.setBounds(null)
        this.cropView.setBounds(null)
        this.imageView.clearRect()
        this.resizeView.clearRect()
        this.cropView.clearRect()
      }
    },
  },
  mounted () {
    if (!this.imageView) {
      this.imageView = new ImageView(this.$refs.viewCanvas)
    }
    if (!this.resizeView) {
      this.resizeView = new ResizeView(this.$refs.viewCanvas, { ...DEFAULT_RESIZE_HANDLER_STYLE, ...this.resizeHandlerStyle })
    }
    if (!this.cropView) {
      this.cropView = new CropView(this.$refs.cropCanvas, { ...DEFAULT_CROP_HANDLER_STYLE, ...this.cropHandlerStyle }, { left: 0, top: 0, right: this.width, bottom: this.height })
    }
  },
  methods: {
    setImage (path) {
      loadImage(path).then(image => this.image = image)
    },
    getPos (event) {
      const { pageX, pageY } = event.touches && event.touches.length > 0 ? event.touches[0] : event
      const { offsetLeft, offsetTop } = this.$refs.container
      return { x: pageX - offsetLeft, y: pageY - offsetTop }
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
      if (mode == null) {
        this.editMode = EDIT_MODE.NONE
      } else {
        window.addEventListener('mousemove', this.onMouseMove)
        window.addEventListener('mouseup', this.onMouseUp)
        this.editMode = mode === HANDLER_POS.MOVE ? EDIT_MODE.MOVE : EDIT_MODE.RESIZE
        this.prevPos = curPos
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
        if (!this.isCrop) {
          this.imageView.setBounds(this.resizeView.bounds)
        }
        this.render()
        this.prevPos = curPos
      }
    },
    onMouseUp (event) {
      if (this.editMode !== EDIT_MODE.NONE) {
        this.resizeView.mode = null
        this.cropView.mode = null
        this.editMode = EDIT_MODE.NONE
        this.prevPos = null
      }
      window.removeEventListener('mousemove', this.onDocumentMouseMove)
      window.removeEventListener('mouseup', this.onMouseUp)
    },
    onClickCrop () {
      this.isCrop = false
      this.imageView.resize()
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
      this.imageView.setBounds(bounds)
      this.resizeView.setBounds(bounds)
      this.render()
      this.$emit('changeImage', this.getImage())
    },
    getImage () {
      return this.imageView.image
    },
  }
}
</script>
