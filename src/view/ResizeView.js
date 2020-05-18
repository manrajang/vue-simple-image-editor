import RenderView from './RenderView'
import { HANDLER_POS } from '@/constants'

function dist (p1, p2) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
}

function point (x, y) {
  return { x, y }
}

export default class ResizeView extends RenderView {
  constructor (canvas, handlerSize) {
    super(canvas)
    this.handlerSize = handlerSize
    this.boundaryBounds = null
    this.mode = null
  }
  draw () {
    if (!this.bounds) {
      return
    }
    const { left, top, right, bottom } = this.bounds
    const width = right - left
    const height = bottom - top
    this.ctx.save()
    this.ctx.strokeStyle = '#FF0000'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(left, top, width, height)
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
    this.ctx.arc(x, y, this.handlerSize, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.closePath()
  }
  setMode (mousePoint) {
    const { x: posX, y: posY } = mousePoint
    const { left, top, right, bottom } = this.bounds
    const width = right - left
    const height = bottom - top
    if (dist(mousePoint, point(left, top)) <= this.handlerSize) {
      this.mode = HANDLER_POS.TOP_LEFT
    } else if (dist(mousePoint, point(right, top)) <= this.handlerSize) {
      this.mode = HANDLER_POS.TOP_RIGHT
    } else if (dist(mousePoint, point(left, bottom)) <= this.handlerSize) {
      this.mode = HANDLER_POS.BOTTOM_LEFT
    } else if (dist(mousePoint, point(right, bottom)) <= this.handlerSize) {
      this.mode = HANDLER_POS.BOTTOM_RIGHT
    } else if (dist(mousePoint, point(left + width / 2, top)) <= this.handlerSize) {
      this.mode = HANDLER_POS.TOP
    } else if (dist(mousePoint, point(left + width / 2, bottom)) <= this.handlerSize) {
      this.mode = HANDLER_POS.BOTTOM
    } else if (dist(mousePoint, point(left, top + height / 2)) <= this.handlerSize) {
      this.mode = HANDLER_POS.LEFT
    } else if (dist(mousePoint, point(right, top + height / 2)) <= this.handlerSize) {
      this.mode = HANDLER_POS.RIGHT
    } else if (posX > left && posY > top && posX < right && posY < bottom) {
      this.mode = HANDLER_POS.MOVE
    } else {
      this.mode = null
    }
  }
  changeResizeBounds ({ x: mouseX, y: mouseY }) {
    const { left, top, right, bottom } = this.bounds
    const { left: boundaryLeft, top: boundaryTop, right: boundaryRight, bottom: boundaryBottom } = this.boundaryBounds
    const newBounds = { left, top, right, bottom }
    if ((this.mode & HANDLER_POS.LEFT) === HANDLER_POS.LEFT) {
      if (mouseX < boundaryLeft) {
        newBounds.left = boundaryLeft
      } else if (mouseX > right - this.handlerSize) {
        newBounds.left = right - this.handlerSize
      } else {
        newBounds.left = mouseX
      }
    }
    if ((this.mode & HANDLER_POS.TOP) === HANDLER_POS.TOP) {
      if (mouseY < boundaryTop) {
        newBounds.top = boundaryTop
      } else if (mouseY > bottom - this.handlerSize) {
        newBounds.top = bottom - this.handlerSize
      } else {
        newBounds.top = mouseY
      }
    }
    if ((this.mode & HANDLER_POS.RIGHT) === HANDLER_POS.RIGHT) {
      if (mouseX > boundaryRight) {
        newBounds.right = boundaryRight
      } else if (mouseX < left + this.handlerSize) {
        newBounds.right = left + this.handlerSize
      } else {
        newBounds.right = mouseX
      }
    }
    if ((this.mode & HANDLER_POS.BOTTOM) === HANDLER_POS.BOTTOM) {
      if (mouseY > boundaryBottom) {
        newBounds.bottom = boundaryBottom
      } else if (mouseY < top + this.handlerSize) {
        newBounds.bottom = top + this.handlerSize
      } else {
        newBounds.bottom = mouseY
      }
    }
    this.bounds = newBounds
  }
  changeMoveBounds ({ x: curPosX, y: curPosY }, { x: prevPosX, y: prevPosY }) {
    const { left, top, right, bottom } = this.bounds
    const { left: boundaryLeft, top: boundaryTop, right: boundaryRight, bottom: boundaryBottom } = this.boundaryBounds
    const width = right - left
    const height = bottom - top
    let newBoundsX = left + (curPosX - prevPosX)
    let newBoundsY = top + (curPosY - prevPosY)
    if (newBoundsX < boundaryLeft) {
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
    this.bounds = { left: newBoundsX, top: newBoundsY, right: newBoundsX + width, bottom: newBoundsY + height }
  }
}
