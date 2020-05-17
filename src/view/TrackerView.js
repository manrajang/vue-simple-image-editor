import RenderView from './RenderView'
import { HANDLER_POS } from '@/constants'

const HANDLER_SIZE = 10

function dist (p1, p2) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
}

function point (x, y) {
  return { x, y }
}

export default class TrackerView extends RenderView {
  constructor (canvas, isCrop = false) {
    super(canvas)
    this.isCrop = isCrop
  }
  draw ({ left, top, right, bottom }) {
    const width = right - left
    const height = bottom - top
    this.ctx.save()
    this.ctx.strokeStyle = '#FF0000'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(left, top, width, height)
    if (this.isCrop) {
      this.ctx.globalAlpha = 0.1
      this.ctx.fillStyle = '#C0C0C0'
      this.ctx.fillRect(left, top, width, height)
    }
    this.drawHandler(left, top)
    this.drawHandler(right, top)
    this.drawHandler(left, bottom)
    this.drawHandler(right, bottom)
    this.drawHandler(left + width / 2, top)
    this.drawHandler(left + width / 2, bottom)
    this.drawHandler(left, top + height / 2)
    this.drawHandler(right, top + height / 2)
    this.ctx.restore()
  }
  drawHandler (x, y) {
    this.ctx.fillStyle = '#FF0000'
    this.ctx.beginPath()
    this.ctx.arc(x, y, HANDLER_SIZE, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.closePath()
  }
  getHandler (mousePoint, { left, top, right, bottom }) {
    const width = right - left
    const height = bottom - top
    if (dist(mousePoint, point(left, top)) <= HANDLER_SIZE) {
      return HANDLER_POS.TOP_LEFT
    } else if (dist(mousePoint, point(right, top)) <= HANDLER_SIZE) {
      return HANDLER_POS.TOP_RIGHT
    } else if (dist(mousePoint, point(left, bottom)) <= HANDLER_SIZE) {
      return HANDLER_POS.BOTTOM_LEFT
    } else if (dist(mousePoint, point(right, bottom)) <= HANDLER_SIZE) {
      return HANDLER_POS.BOTTOM_RIGHT
    } else if (dist(mousePoint, point(left + width / 2, top)) <= HANDLER_SIZE) {
      return HANDLER_POS.TOP
    } else if (dist(mousePoint, point(left + width / 2, bottom)) <= HANDLER_SIZE) {
      return HANDLER_POS.BOTTOM
    } else if (dist(mousePoint, point(left, top + height / 2)) <= HANDLER_SIZE) {
      return HANDLER_POS.LEFT
    } else if (dist(mousePoint, point(right, top + height / 2)) <= HANDLER_SIZE) {
      return HANDLER_POS.RIGHT
    }
    return null
  }
}
