import { SHAPE_TYPE } from '@/constants'

export default class RenderController {
  constructor (canvas, width, height) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
  }
  draw ({ type, bounds, pathList }) {
    switch (type) {
      case SHAPE_TYPE.RECT:
        this.drawRect(bounds)
        break
      case SHAPE_TYPE.FREE:
        this.drawFree(pathList)
        break
      default:
    }
  }
  drawRect ({ x, y, width, height }) {
    this.ctx.beginPath()
    this.ctx.fillRect(x, y, width, height)
    this.ctx.closePath()
  }
  drawFree (pathList) {
    this.ctx.beginPath()
    pathList.forEach(path => {
      const { x, y } = path.pos
      if (path.type === 'm') {
        this.ctx.moveTo(x, y)
      } else if (path.type === 'l') {
        this.ctx.lineTo(x, y)
      }
      this.ctx.stroke()
    })
    this.ctx.closePath()
  }
  clearRect () {
    console.log('123')
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}
