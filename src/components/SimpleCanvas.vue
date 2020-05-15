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
    <!-- <canvas
      :height="height"
      :width="width"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      id="editorCanvas"
      ref="editorCanvas"
    ></canvas> -->
  </div>
</template>

<script>
import ImageView from '@/view/ImageView'
import TrackerView from '@/view/TrackerView'
import { HANDLER_POS } from '@/constants'

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
    mode: { type: String, defaul: 'resize' },
    imageSrc: { type: String, default: null },
    imageObj: { type: Object, default: null }
  },
  data () {
    return {
      shapeList: [],
      imageView: null,
      trackerView: null,
      image: null,
      bounds: null,
      handlerPos: null,
      isMoving: false,
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
    drawResize () {
      if (this.bounds) {
        if (!this.isMoving) {
          window.requestAnimationFrame(() => {
            this.imageView.draw(this.bounds)
            this.trackerView.draw(this.bounds)
            this.isMoving = false
          })
          this.isMoving = true
        }
      }
    },
    onMouseDown (event) {
      this.handlerPos = this.trackerView.getHandler(this.getPos(event), this.bounds)
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
      if (this.handlerPos != null) {
        const { x, y, width, height } = this.bounds
        this.bounds = changeBoounds(this.bounds, this.getPos(event), this.handlerPos)
        this.drawResize()
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
      this.handlerPos = null
      // if (this.isDrwaing) {
      //   this.cursorMode = CURSOR_MODE_TYPE.END
      //   this.setBounds(this.getPos(event))
      //   this.shapeList.push(this.shape)
      //   this.shape = null
      //   this.drawShapeList()
      // }
    },
    onDocumentMouseUp (event) {
      this.handlerPos = null
    },
    getPos ({ pageX, pageY }) {
      const { offsetLeft, offsetTop } = this.$refs.container
      return { x: pageX - offsetLeft, y: pageY - offsetTop }
    },
  }
}
</script>

<style scope lang='scss'>
  .container {
    position: relative;
    canvas {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
</style>
