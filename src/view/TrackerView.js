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
  draw ({ x, y, width, height, rotate }) {
    this.ctx.save()
    this.ctx.strokeStyle = '#FF0000'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(x, y, width, height)
    this.drawHandler(x, y)
    this.drawHandler(x + width, y)
    this.drawHandler(x, y + height)
    this.drawHandler(x + width, y + height)
    this.drawHandler(x + width / 2, y)
    this.drawHandler(x + width / 2, y + height)
    this.drawHandler(x, y + height / 2)
    this.drawHandler(x + width, y + height / 2)
    this.ctx.restore()
  }
  drawHandler (x, y) {
    this.ctx.fillStyle = '#FF0000'
    this.ctx.beginPath()
    this.ctx.arc(x, y, HANDLER_SIZE, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.closePath()
  }
  getHandler (mousePoint, { x, y, width, height, rotate }) {
    if (dist(mousePoint, point(x, y)) <= HANDLER_SIZE) {
      return HANDLER_POS.TOP_LEFT
    } else if (dist(mousePoint, point(x + width, y)) <= HANDLER_SIZE) {
      return HANDLER_POS.TOP_RIGHT
    } else if (dist(mousePoint, point(x, y + height)) <= HANDLER_SIZE) {
      return HANDLER_POS.BOTTOM_LEFT
    } else if (dist(mousePoint, point(x + width, y + height)) <= HANDLER_SIZE) {
      return HANDLER_POS.BOTTOM_RIGHT
    } else if (dist(mousePoint, point(x + width / 2, y)) <= HANDLER_SIZE) {
      return HANDLER_POS.TOP
    } else if (dist(mousePoint, point(x + width / 2, y + height)) <= HANDLER_SIZE) {
      return HANDLER_POS.BOTTOM
    } else if (dist(mousePoint, point(x, y + height / 2)) <= HANDLER_SIZE) {
      return HANDLER_POS.LEFT
    } else if (dist(mousePoint, point(x + width, y + height / 2)) <= HANDLER_SIZE) {
      return HANDLER_POS.RIGHT
    }
    return null
  }
}
