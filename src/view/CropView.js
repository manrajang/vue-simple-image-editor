import ResizeView from './ResizeView'
import { HANDLER_POS } from '@/constants'

export default class CropView extends ResizeView {
  constructor (canvas, style) {
    super(canvas, style)
    const { fillColor, fillAlpha } = style
    this.fillColor = fillColor
    this.fillAlpha = fillAlpha
    this.isFixedCrop = false
  }
  draw () {
    if (!this.bounds) {
      return
    }
    this.clearRect()
    super.draw()
  }
  drawRect (x, y, width, height) {
    this.ctx.strokeStyle = this.lineStrokeStyle
    this.ctx.lineWidth = this.lineWidth
    this.ctx.strokeRect(x, y, width, height)
    this.ctx.globalAlpha = this.fillAlpha
    this.ctx.fillStyle = this.fillColor
    this.ctx.fillRect(x, y, width, height)
    this.ctx.globalAlpha = 1
  }
  drawHandlerList () {
    if (!this.isFixedCrop) {
      super.drawHandlerList()
    }
  }
  setMode (mousePoint) {
    if (this.isFixedCrop) {
      const { x: posX, y: posY } = mousePoint
      const { left, top, right, bottom } = this.bounds
      if (posX > left && posY > top && posX < right && posY < bottom) {
        this.mode = HANDLER_POS.MOVE
      } else {
        this.mode = null
      }
      return
    }
    super.setMode(mousePoint)
  }
}
