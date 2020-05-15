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
      class="resize-canvas"
      :height="height"
      :width="width"
      id="editorCanvas"
      ref="editorCanvas"
      style="background:red;"
    ></canvas>
  </div>
</template>

<script>
import ImageView from '@/view/ImageView'
import TrackerView from '@/view/TrackerView'
import { HANDLER_POS, EDIT_MODE } from '@/constants'

function loadImage (src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function changeBoounds (bounds, mousePos, mode) {
  const newBounds = { ...bounds }
  switch (mode) {
    case HANDLER_POS.TOP_LEFT:
      newBounds.x = mousePos.x
      newBounds.y = mousePos.y
      newBounds.width = bounds.x - mousePos.x + bounds.width
      newBounds.height = bounds.y - mousePos.y + bounds.height
      break
    case HANDLER_POS.TOP_RIGHT:
      newBounds.y = mousePos.y
      newBounds.width = mousePos.x - bounds.x
      newBounds.height = bounds.y - mousePos.y + bounds.height
      break
    case HANDLER_POS.BOTTOM_LEFT:
      newBounds.x = mousePos.x
      newBounds.width = bounds.x - mousePos.x + bounds.width
      newBounds.height = mousePos.y - bounds.y
      break
    case HANDLER_POS.BOTTOM_RIGHT:
      newBounds.width = mousePos.x - bounds.x
      newBounds.height = mousePos.y - bounds.y
      break
    case HANDLER_POS.TOP:
      newBounds.y = mousePos.y
      newBounds.height = bounds.y - mousePos.y + bounds.height
      break
    case HANDLER_POS.BOTTOM:
      newBounds.height = mousePos.y - bounds.y
      break
    case HANDLER_POS.LEFT:
      newBounds.x = mousePos.x
      newBounds.width = bounds.x - mousePos.x + bounds.width
      break
    case HANDLER_POS.RIGHT:
      newBounds.width = mousePos.x - bounds.x
      break
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
      trackerView: null,
      image: null,
      bounds: null,
      cropBounds: null,
      editMode: EDIT_MODE.NONE,
      resizeMode: null,
      isDrawing: false,
      prevPos: null,
    }
  },
  watch: {
    isCrop: {
      immediate: true,
      handler (value) {
        this.editMode = value ? EDIT_MODE.CROP : EDIT_MODE.NONE
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
        this.bounds = { x: (this.width - width) / 2, y: (this.height - height) / 2, width, height }
        this.imageView.image = value
        this.drawResize()
      } else {
        this.bounds = null
      }
    },
    bounds (value) {
      this.cropBounds = value ? { ...value } : null
    }
  },
  created () {
    window.addEventListener('mouseup', this.onDocumentMouseUp)
  },
  mounted () {
    if (!this.imageView) {
      this.imageView = new ImageView(this.$refs.viewCanvas)
    }
    if (!this.trackerView) {
      this.trackerView = new TrackerView(this.$refs.viewCanvas)
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
    drawResize () {
      if (this.bounds) {
        if (!this.isDrawing) {
          window.requestAnimationFrame(() => {
            this.imageView.draw(this.bounds)
            this.trackerView.draw(this.bounds)
            this.isDrawing = false
          })
          this.isDrawing = true
        }
      }
    },
    onMouseDown (event) {
      const curPos = this.getPos(event)
      this.resizeMode = this.trackerView.getHandler(curPos, this.bounds)
      if (this.resizeMode == null) {
        const { x, y, width, height } = this.bounds
        const { x: posX, y: posY } = curPos
        this.editMode = posX > x && posY > y && posX < x + width && posY < y + height ? EDIT_MODE.MOVE : EDIT_MODE.NONE
      } else {
        this.editMode = EDIT_MODE.RESIZE
      }
      this.prevPos = curPos
      // if (this.mode !== DRAW_MODE_TYPE.MOVE) {
      //   this.cursorMode = CURSOR_MODE_TYPE.DRAWING
      //   this.curPos = this.getPos(event)
      //   this.startPos = { ...this.curPos }
      //   const { x, y } = this.startPos
      //   this.shape = {
      //     type: this.SHAPE_TYPE,
      //     bounds: { x, y, width: 0, height: 0 },
      //     pathList: []
      //   }
      // }
    },
    onMouseMove (event) {
      if (this.editMode !== EDIT_MODE.NONE) {
        const { x, y, width, height } = this.bounds
        const curPos = this.getPos(event)
        if (this.editMode === EDIT_MODE.RESIZE) {
          this.bounds = changeBoounds(this.bounds, curPos, this.handlerPos)
          this.drawResize()
        } else if (this.editMode === EDIT_MODE.MOVE) {
          const { x: curPosX, y: curPosY } = curPos
          const { x: prevPosX, y: prevPosY } = this.prevPos
          let newBoundsX = x + (curPosX - prevPosX)
          let newBoundsY = y + (curPosY - prevPosY)
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
          this.bounds = { x: newBoundsX, y: newBoundsY, width, height }
          this.drawResize()
        }
        this.prevPos = curPos
      }
      // if (this.isDrwaing) {
      //   const { pathList } = this.shape
      //   this.editorController.clearRect()
      //   this.prevPos = { ...this.curPos }
      //   this.curPos = this.getPos(event)
      //   this.setBounds(this.curPos)
      //   const { x: prevX, y: prevY } = this.prevPos
      //   const { x: curX, y: curY } = this.curPos
      //   pathList.push({ type: 'm', pos: { x: prevX, y: prevY } })
      //   pathList.push({ type: 'l', pos: { x: curX, y: curY } })
      //   this.editorController.draw(this.shape)
      // }
    },
    onMouseUp (event) {
      this.initMode()
      // if (this.isDrwaing) {
      //   this.cursorMode = CURSOR_MODE_TYPE.END
      //   this.setBounds(this.getPos(event))
      //   this.shapeList.push(this.shape)
      //   this.shape = null
      //   this.drawShapeList()
      // }
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
    }
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
