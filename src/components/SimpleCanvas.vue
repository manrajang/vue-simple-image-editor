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
      v-show="shape"
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
      viewCtx: null,
      ctx: null,
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
    })
  },
  watch: {
    shapeList () {
      this.drawShapeList()
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
        this.curPos = this.getPos(event)
        this.startPos = { ...this.curPos }
        this.shape = {
          type: this.SHAPE_TYPE,
          bounds: { x: this.startPos.x, y: this.startPos.y, width: 0, height: 0 },
          pathList: []
        }
      }
    },
    onMouseMove (event) {
      if (this.shape) {
        this.editorController.clearRect()
        this.prevPos = { ...this.curPos }
        this.curPos = this.getPos(event)
        const { bounds, pathList } = this.shape
        bounds.width = this.curPos.x - bounds.x
        bounds.height = this.curPos.y - bounds.y
        pathList.push({ type: 'm', pos: { x: this.prevPos.x, y: this.prevPos.y } })
        pathList.push({ type: 'l', pos: { x: this.curPos.x, y: this.curPos.y } })
        this.editorController.draw(this.shape)
      }
    },
    onMouseUp (event) {
      if (this.shape) {
        const endPos = this.getPos(event)
        const { bounds } = this.shape
        bounds.width = endPos.x - bounds.x
        bounds.height = endPos.y - bounds.y
        this.shapeList.push(this.shape)
        this.shape = null
      }
    },
    getPos ({ pageX, pageY }) {
      const { offsetLeft, offsetTop } = this.$refs.container
      return { x: pageX - offsetLeft, y: pageY - offsetTop }
    },
    drawShapeList () {
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
