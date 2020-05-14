<template>
  <div :style="{ width: width + 'px', height: height + 'px' }" class="container" ref="container">
    <canvas
      :height="height"
      :width="width"
      @mousedown="onMouseDown"
      id="viewCanvas"
      ref="viewCanvas"
    ></canvas>
    <canvas
      :height="height"
      :width="width"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      id="editorCanvas"
      ref="editorCanvas"
      v-show="isDrwaing"
    ></canvas>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RenderController from '@/controller/RenderController'
import { DRAW_MODE_TYPE, CURSOR_MODE_TYPE } from '@/constants'

export default {
  props: {
    width: { type: Number, default: 500 },
    height: { type: Number, default: 500 }
  },
  data () {
    return {
      cursorMode: null,
      startPos: { x: 0, y: 0 },
      prevPos: { x: 0, y: 0 },
      curPos: { x: 0, y: 0 },
      shapeList: [],
      viewController: null,
      editorController: null,
      shape: null,
    }
  },
  computed: {
    ...mapState({
      DRAW_MODE: 'drawMode',
      SHAPE_TYPE: 'shapeType',
    }),
    isDrwaing () {
      return this.cursorMode === CURSOR_MODE_TYPE.DRAWING
    }
  },
  mounted () {
    if (!this.viewController) {
      this.viewController = new RenderController(this.$refs.viewCanvas)
    }
    if (!this.editorController) {
      this.editorController = new RenderController(this.$refs.editorCanvas)
    }
  },
  methods: {
    onMouseDown (event) {
      if (this.DRAW_MODE !== DRAW_MODE_TYPE.MOVE) {
        this.cursorMode = CURSOR_MODE_TYPE.DRAWING
        this.curPos = this.getPos(event)
        this.startPos = { ...this.curPos }
        const { x, y } = this.startPos
        this.shape = {
          type: this.SHAPE_TYPE,
          bounds: { x, y, width: 0, height: 0 },
          pathList: []
        }
      }
    },
    onMouseMove (event) {
      if (this.isDrwaing) {
        const { pathList } = this.shape
        this.editorController.clearRect()
        this.prevPos = { ...this.curPos }
        this.curPos = this.getPos(event)
        this.setBounds(this.curPos)
        const { x: prevX, y: prevY } = this.prevPos
        const { x: curX, y: curY } = this.curPos
        pathList.push({ type: 'm', pos: { x: prevX, y: prevY } })
        pathList.push({ type: 'l', pos: { x: curX, y: curY } })
        this.editorController.draw(this.shape)
      }
    },
    onMouseUp (event) {
      if (this.isDrwaing) {
        this.cursorMode = CURSOR_MODE_TYPE.END
        this.setBounds(this.getPos(event))
        this.shapeList.push(this.shape)
        this.shape = null
        this.drawShapeList()
      }
    },
    getPos ({ pageX, pageY }) {
      const { offsetLeft, offsetTop } = this.$refs.container
      return { x: pageX - offsetLeft, y: pageY - offsetTop }
    },
    setBounds ({ x, y }) {
      const { bounds } = this.shape
      bounds.width = x - bounds.x
      bounds.height = y - bounds.y
    },
    drawShapeList () {
      this.viewController.clearRect()
      this.shapeList.forEach(shape => this.viewController.draw(shape))
    }
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
