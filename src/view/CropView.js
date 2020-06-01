import ResizeView from './ResizeView'
import { HANDLER_POS } from '@/constants'

export default class CropView extends ResizeView {
  constructor (canvas, style, boundaryBounds) {
    super(canvas, style)
    const { fillColor, fillAlpha } = style
    this.fillColor = fillColor
    this.fillAlpha = fillAlpha
    this.boundaryBounds = boundaryBounds
    this.isFixedCrop = false
  }
  draw () {
    if (!this.bounds) {
      return
    }
    this.clearRect()
    super.draw()
  }
  setBounds (bounds) {
    this.bounds = bounds ? { ...bounds, angle: 0 } : null
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
  drawRotation () {}
  drawHandlerList () {
    if (!this.isFixedCrop) {
      super.drawHandlerList()
    }
  }
  drawLineList () {
    const { left, top, right, bottom } = this.bounds
    const width = right - left
    const height = bottom - top
    let x = left + width * 1 / 3
    this.ctx.setLineDash([5, 5])
    this.drawLine(x, top, x, bottom)
    x = left + width * 2 / 3
    this.drawLine(x, top, x, bottom)
    let y = top + height * 1 / 3
    this.drawLine(left, y, right, y)
    y = top + height * 2 / 3
    this.drawLine(left, y, right, y)
  }
  drawLine (mx, my, lx, ly) {
    this.ctx.beginPath()
    this.ctx.moveTo(mx, my)
    this.ctx.lineTo(lx, ly)
    this.ctx.stroke()
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
    if (this.mode === HANDLER_POS.ROTATION) {
      this.mode = null
    }
  }
  changeResizeBounds (mousePoint) {
    super.changeResizeBounds(mousePoint)
    const { x, y } = mousePoint
    const { left: boundaryLeft, top: boundaryTop, right: boundaryRight, bottom: boundaryBottom } = this.boundaryBounds
    const newBounds = { ...this.bounds }
    if ((this.mode & HANDLER_POS.LEFT) === HANDLER_POS.LEFT) {
      if (x < boundaryLeft) {
        newBounds.left = boundaryLeft
      }
    }
    if ((this.mode & HANDLER_POS.TOP) === HANDLER_POS.TOP) {
      if (y < boundaryTop) {
        newBounds.top = boundaryTop
      }
    }
    if ((this.mode & HANDLER_POS.RIGHT) === HANDLER_POS.RIGHT) {
      if (x > boundaryRight) {
        newBounds.right = boundaryRight
      }
    }
    if ((this.mode & HANDLER_POS.BOTTOM) === HANDLER_POS.BOTTOM) {
      if (y > boundaryBottom) {
        newBounds.bottom = boundaryBottom
      }
    }
    this.setBounds(newBounds)
  }
  changeMoveBounds ({ x: curPosX, y: curPosY }, { x: prevPosX, y: prevPosY }) {
    const { left, top, right, bottom } = this.bounds
    const { left: boundaryLeft, top: boundaryTop, right: boundaryRight, bottom: boundaryBottom } = this.boundaryBounds
    const width = right - left
    const height = bottom - top
    let newBoundsX = left + (curPosX - prevPosX)
    let newBoundsY = top + (curPosY - prevPosY)
    if (left < boundaryLeft) {
      newBoundsX = boundaryLeft
    }
    if (newBoundsY < boundaryTop) {
      newBoundsY = boundaryTop
    }
    if (newBoundsX + width > boundaryRight) {
      newBoundsX = boundaryRight - width
    }
    if (newBoundsY + height > boundaryBottom) {
      newBoundsY = boundaryBottom - height
    }
    this.setBounds({ left: newBoundsX, top: newBoundsY, right: newBoundsX + width, bottom: newBoundsY + height })
  }
}
