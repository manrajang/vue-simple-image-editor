import RenderView from './RenderView'
import { HANDLER_POS } from '@/constants'
import { rotate, compose, applyToPoint } from 'transformation-matrix'

function dist (p1, p2) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
}

function point (x, y) {
  return { x, y }
}

function convertBounds ({ left: newLeft, top: newTop, right: newRight, bottom: newBottom }, { left, top, right, bottom, angle }) {
  const matrix = compose(
    rotate(angle * Math.PI / 180, left + (right - left) / 2, top + (bottom - top) / 2),
    rotate(-angle * Math.PI / 180, newLeft + (newRight - newLeft) / 2, newTop + (newBottom - newTop) / 2)
  )
  const { x: l, y: t } = applyToPoint(matrix, { x: newLeft, y: newTop })
  const { x: r, y: b } = applyToPoint(matrix, { x: newRight, y: newBottom })
  return { left: l, top: t, right: r, bottom: b, angle }
}

function convertPoint ({ x, y }, { left, top, right, bottom, angle }) {
  return applyToPoint(compose(rotate(-angle * Math.PI / 180, left + (right - left) / 2, top + (bottom - top) / 2)), { x, y })
}

export default class ResizeView extends RenderView {
  constructor (canvas, { strokeColor, strokeWidth, handlerFillColor, handlerSize }) {
    super(canvas)
    this.strokeColor = strokeColor
    this.strokeWidth = strokeWidth
    this.handlerFillColor = handlerFillColor
    this.handlerSize = handlerSize
    this.mode = null
  }
  draw () {
    if (!this.bounds) {
      return
    }
    const { left, top, right, bottom, angle } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(angle * Math.PI / 180)
    this.ctx.translate(-centerX, -centerY)
    this.drawRect(left, top, right - left, bottom - top)
    this.drawHandlerList()
    this.ctx.restore()
  }
  drawRect (x, y, width, height) {
    this.ctx.strokeStyle = this.strokeColor
    this.ctx.lineWidth = this.strokeWidth
    this.ctx.strokeRect(x, y, width, height)
  }
  drawHandler (x, y) {
    const width = 2 * this.handlerSize
    this.ctx.fillStyle = this.handlerFillColor
    this.ctx.fillRect(x - this.handlerSize, y - this.handlerSize, width, width)
  }
  drawHandlerList () {
    const { left, top, right, bottom } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    this.drawHandler(left, top)
    this.drawHandler(right, top)
    this.drawHandler(left, bottom)
    this.drawHandler(right, bottom)
    this.drawHandler(centerX, top)
    this.drawHandler(centerX, bottom)
    this.drawHandler(left, centerY)
    this.drawHandler(right, centerY)
  }
  setMode (mousePoint) {
    const { left, top, right, bottom } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    const newMousePoint = convertPoint(mousePoint, this.bounds)
    const { x, y } = newMousePoint
    if (dist(newMousePoint, point(left, top)) <= this.handlerSize) {
      this.mode = HANDLER_POS.TOP_LEFT
    } else if (dist(newMousePoint, point(right, top)) <= this.handlerSize) {
      this.mode = HANDLER_POS.TOP_RIGHT
    } else if (dist(newMousePoint, point(left, bottom)) <= this.handlerSize) {
      this.mode = HANDLER_POS.BOTTOM_LEFT
    } else if (dist(newMousePoint, point(right, bottom)) <= this.handlerSize) {
      this.mode = HANDLER_POS.BOTTOM_RIGHT
    } else if (dist(newMousePoint, point(centerX, top)) <= this.handlerSize) {
      this.mode = HANDLER_POS.TOP
    } else if (dist(newMousePoint, point(centerX, bottom)) <= this.handlerSize) {
      this.mode = HANDLER_POS.BOTTOM
    } else if (dist(newMousePoint, point(left, centerY)) <= this.handlerSize) {
      this.mode = HANDLER_POS.LEFT
    } else if (dist(newMousePoint, point(right, centerY)) <= this.handlerSize) {
      this.mode = HANDLER_POS.RIGHT
    } else if (x > left && y > top && x < right && y < bottom) {
      this.mode = HANDLER_POS.MOVE
    } else {
      this.mode = null
    }
  }
  changeResizeBounds (mousePoint) {
    const { x, y } = convertPoint(mousePoint, this.bounds)
    const { left, top, right, bottom } = this.bounds
    const newBounds = { ...this.bounds }
    if ((this.mode & HANDLER_POS.LEFT) === HANDLER_POS.LEFT) {
      if (x > right - this.handlerSize) {
        newBounds.left = right - this.handlerSize
      } else {
        newBounds.left = x
      }
    }
    if ((this.mode & HANDLER_POS.TOP) === HANDLER_POS.TOP) {
      if (y > bottom - this.handlerSize) {
        newBounds.top = bottom - this.handlerSize
      } else {
        newBounds.top = y
      }
    }
    if ((this.mode & HANDLER_POS.RIGHT) === HANDLER_POS.RIGHT) {
      if (x < left + this.handlerSize) {
        newBounds.right = left + this.handlerSize
      } else {
        newBounds.right = x
      }
    }
    if ((this.mode & HANDLER_POS.BOTTOM) === HANDLER_POS.BOTTOM) {
      if (y < top + this.handlerSize) {
        newBounds.bottom = top + this.handlerSize
      } else {
        newBounds.bottom = y
      }
    }
    this.setBounds(convertBounds(newBounds, this.bounds))
  }
  changeMoveBounds ({ x: curPosX, y: curPosY }, { x: prevPosX, y: prevPosY }) {
    const { left, top, right, bottom, angle } = this.bounds
    const newBoundsX = left + (curPosX - prevPosX)
    const newBoundsY = top + (curPosY - prevPosY)
    this.setBounds({ left: newBoundsX, top: newBoundsY, right: newBoundsX + right - left, bottom: newBoundsY +  bottom - top, angle })
  }
}
