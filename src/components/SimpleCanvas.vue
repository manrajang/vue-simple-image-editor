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
      class="resize-canvas"
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
import TrackerView from '@/view/TrackerView'
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

function changeBounds ({ left, top, right, bottom }, { left: boundaryLeft, top: boundaryTop, right: boundaryRight, bottom: boundaryBottom }, { x: mouseX, y: mouseY }, mode) {
  const width = right - left
  const height = bottom - top
  const newBounds = { left, top, right, bottom }
  if ((mode & HANDLER_POS.LEFT) === HANDLER_POS.LEFT) {
    if (mouseX < boundaryLeft) {
      newBounds.left = boundaryLeft
    } else if (mouseX > right - HANDLER_SIZE) {
      newBounds.left = right - HANDLER_SIZE
    } else {
      newBounds.left = mouseX
    }
  }
  if ((mode & HANDLER_POS.TOP) === HANDLER_POS.TOP) {
    if (mouseY < boundaryTop) {
      newBounds.top = boundaryTop
    } else if (mouseY > bottom - HANDLER_SIZE) {
      newBounds.top = bottom - HANDLER_SIZE
    } else {
      newBounds.top = mouseY
    }
  }
  if ((mode & HANDLER_POS.RIGHT) === HANDLER_POS.RIGHT) {
    if (mouseX > boundaryRight) {
      newBounds.right = boundaryRight
    } else if (mouseX < left + HANDLER_SIZE) {
      newBounds.right = left + HANDLER_SIZE
    } else {
      newBounds.right = mouseX
    }
  }
  if ((mode & HANDLER_POS.BOTTOM) === HANDLER_POS.BOTTOM) {
    if (mouseY > boundaryBottom) {
      newBounds.bottom = boundaryBottom
    } else if (mouseY < top + HANDLER_SIZE) {
      newBounds.bottom = top + HANDLER_SIZE
    } else {
      newBounds.bottom = mouseY
    }
  }
  return newBounds
}

export default {
  props: {
    width: { type: Number, default: 500 },
    height: { type: Number, default: 500 },
    isCrop: { type: Boolean, defaul: false },
    imageSrc: { type: String, default: null },
    imageObj: { type: Object, default: null }
  },
  data () {
    return {
      imageView: null,
      resizeView: null,
      cropView: null,
      image: null,
      bounds: null,
      cropBounds: null,
      originBounds: null,
      editMode: EDIT_MODE.NONE,
      resizeMode: null,
      isDrawing: false,
      prevPos: null,
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
        this.bounds = { left: x, top: y, right: x + width, bottom: y + height }
        this.cropBounds = { ...this.bounds }
        this.imageView.image = value
        this.render()
      } else {
        this.bounds = null
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
      this.resizeView = new TrackerView(this.$refs.viewCanvas)
    }
    if (!this.cropView) {
      this.cropView = new TrackerView(this.$refs.cropCanvas, true)
    }
  },
  destroyed () {
    window.removeEventListener('mouseup', this.onDocumentMouseUp)
  },
  methods: {
    initMode () {
      this.resizeMode = null
      this.editMode = EDIT_MODE.NONE
    },
    render () {
      if (this.bounds) {
        if (!this.isDrawing) {
          window.requestAnimationFrame(() => {
            const renderBounds = this.getRenderBounds()
            this.imageView.draw(this.bounds)
            if (this.isCrop) {
              this.cropView.clearRect()
              this.cropView.draw(renderBounds)
            } else {
              this.resizeView.draw(renderBounds)
            }
            this.isDrawing = false
          })
          this.isDrawing = true
        }
      }
    },
    getTrackerView () {
      return this.isCrop ? this.cropView : this.resizeView
    },
    getBoundaryBounds () {
      return this.isCrop ? { ...this.bounds } : { left: 0, top: 0, right: this.width, bottom: this.height }
    },
    getRenderBounds () {
      return this.isCrop ? this.cropBounds : this.bounds
    },
    setRenderBounds (bounds) {
      if (this.isCrop) {
        this.cropBounds = bounds
      } else {
        this.bounds = bounds
        this.cropBounds = { ...bounds }
      }
    },
    onMouseDown (event) {
      const curPos = this.getPos(event)
      const bounds = this.getRenderBounds()
      this.resizeMode = this.getTrackerView().getHandler(curPos, bounds)
      if (this.resizeMode == null) {
        const { left, top, right, bottom } = bounds
        const { x: posX, y: posY } = curPos
        this.editMode = posX > left && posY > top && posX < right && posY < bottom ? EDIT_MODE.MOVE : EDIT_MODE.NONE
      } else {
        this.editMode = EDIT_MODE.RESIZE
      }
      this.originBounds = { ...bounds }
      this.prevPos = curPos
    },
    resize (curPos) {
      this.setRenderBounds(changeBounds(this.getRenderBounds(), this.getBoundaryBounds(), curPos, this.resizeMode))
    },
    move (curPos) {
      const { left, top, right, bottom } = this.getRenderBounds()
      const { x: curPosX, y: curPosY } = curPos
      const { x: prevPosX, y: prevPosY } = this.prevPos
      const width = right - left
      const height = bottom - top
      let newBoundsX = left + (curPosX - prevPosX)
      let newBoundsY = top + (curPosY - prevPosY)
      if (newBoundsX < 0) {
        newBoundsX = 0
      }
      if (newBoundsY < 0) {
        newBoundsY = 0
      }
      if (newBoundsX + width > this.width) {
        newBoundsX = this.width - width
      }
      if (newBoundsY + height > this.height) {
        newBoundsY = this.height - height
      }
      this.setRenderBounds({ left: newBoundsX, top: newBoundsY, right: newBoundsX + width, bottom: newBoundsY + height })
    },
    onMouseMove (event) {
      if (this.editMode !== EDIT_MODE.NONE) {
        const curPos = this.getPos(event)
        if (this.editMode === EDIT_MODE.RESIZE) {
          this.resize(curPos)
        } else if (this.editMode === EDIT_MODE.MOVE) {
          this.move(curPos)
        }
        this.render()
        this.prevPos = curPos
      }
    },
    onMouseUp (event) {
      this.initMode()
    },
    onDocumentMouseUp (event) {
      this.initMode()
    },
    getPos ({ pageX, pageY }) {
      const { offsetLeft, offsetTop } = this.$refs.container
      return { x: pageX - offsetLeft, y: pageY - offsetTop }
    },
    saveImageFile () {
      if (this.imageView) {
        this.imageView.saveFile(this.bounds)
      }
    },
    crop () {
      if (this.imageView) {
        const { left, top } = this.bounds
        const { left: cropLeft, top: cropTop, right: cropRight, bottom: cropBottom } = this.cropBounds
        this.imageView.crop({ x: cropLeft - left, y: cropTop - top, width: cropRight - cropLeft, height: cropBottom - cropTop })
        this.bounds = { ...this.cropBounds }
        this.render()
      }
    },
  }
}
</script>

<style scope lang='scss'>
  .container {
    position: relative;
    .resize-canvas {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
</style>
