<template>
  <canvas
    :height="height"
    :width="width"
    @mousedown="onMouseDown"
    @mouseleave="onMouseLeave"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    id="simpleCanvas"
    ref="simpleCanvas"
  ></canvas>
</template>

<script>
const DRAW_MODE = {
  START: 0,
  DRAWING: 1,
  END: 2
}

export default {
  props: {
    width: { type: Number, default: 500 },
    height: { type: Number, default: 500 }
  },
  data () {
    return {
      drawMode: null,
      ctx: null,
      lastPos: { x: 0, y: 0 },
      curPos: { x: 0, y: 0 },
    }
  },
  mounted () {
    if (!this.ctx) {
      this.ctx = this.$refs.simpleCanvas.getContext('2d')
      this.ctx.lineWidth = 5
      this.ctx.lineJoin = 'round'
      this.ctx.lineCap = 'round'
      this.ctx.strokeStyle = 'blue'
    }
  },
  methods: {
    onMouseDown (event) {
      this.drawMode = DRAW_MODE.START
      this.setPos(event)
      this.startFree()
    },
    onMouseMove (event) {
      if (this.drawMode === DRAW_MODE.START) {
        this.lastPos.x = this.curPos.x
        this.lastPos.y = this.curPos.y
        this.setPos(event)
        this.drawFree(this.lastPos.x, this.lastPos.y, this.curPos.x, this.curPos.y)
      }
    },
    onMouseUp (event) {
      this.drawMode = DRAW_MODE.END
      this.endFree()
    },
    onMouseLeave (event) {
      this.drawMode = DRAW_MODE.END
      this.endFree()
    },
    setPos (event) {
      const { offsetLeft, offsetTop } = this.$refs.simpleCanvas
      this.curPos.x = event.pageX - offsetLeft
      this.curPos.y = event.pageY - offsetTop
    },
    startFree () {
      this.ctx.beginPath()
    },
    drawFree (mX, mY, lX, lY) {
      this.ctx.moveTo(mX, mY)
      this.ctx.lineTo(lX, lY)
      this.ctx.stroke()
    },
    endFree () {
      this.ctx.closePath()
    }
  }
}
</script>

<style>

</style>
