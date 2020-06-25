import RenderView from './RenderView'
import { HANDLER_POS } from '@/constants'
import { rotate, compose, applyToPoint } from 'transformation-matrix'

function dist (p1: Point, p2: Point) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y))
}

function point (x: number, y: number): Point {
  return { x, y }
}

function convertBounds ({ left: newLeft, top: newTop, right: newRight, bottom: newBottom }: Bounds, { left, top, right, bottom, angle }: Bounds) {
  const matrix = compose(
    rotate(angle * Math.PI / 180, left + (right - left) / 2, top + (bottom - top) / 2),
    rotate(-angle * Math.PI / 180, newLeft + (newRight - newLeft) / 2, newTop + (newBottom - newTop) / 2)
  )
  const { x: l, y: t } = applyToPoint(matrix, { x: newLeft, y: newTop })
  const { x: r, y: b } = applyToPoint(matrix, { x: newRight, y: newBottom })
  return { left: l, top: t, right: r, bottom: b, angle }
}

function convertPoint ({ x, y }: Point, { left, top, right, bottom, angle }: Bounds) {
  return applyToPoint(compose(rotate(-angle * Math.PI / 180, left + (right - left) / 2, top + (bottom - top) / 2)), { x, y })
}

const DEFAULT_COLOR = '#FF0000'
const DEFAULT_STROKE_WIDTH = 2
const DEFAULT_HANDLER_SIZE = 7

export default class ResizeView extends RenderView {
  public mode: HANDLER_POS | null = null
  protected strokeColor = DEFAULT_COLOR
  protected strokeWidth = DEFAULT_STROKE_WIDTH
  private handlerFillColor = DEFAULT_COLOR
  private handlerSize = DEFAULT_HANDLER_SIZE
  // private touchSize = DEFAULT_HANDLER_SIZE + 5

  setStyle ({ strokeColor = DEFAULT_COLOR, strokeWidth = DEFAULT_STROKE_WIDTH, handlerFillColor = DEFAULT_COLOR, handlerSize = DEFAULT_HANDLER_SIZE }: Style) {
    this.strokeColor = strokeColor
    this.strokeWidth = strokeWidth
    this.handlerFillColor = handlerFillColor
    this.handlerSize = handlerSize
    // this.touchSize = this.handlerSize + 5
  }

  draw () {
    if (!this.bounds || !this.ctx) {
      return
    }
    const { left, top, right, bottom, angle } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(angle * Math.PI / 180)
    this.ctx.translate(-centerX, -centerY)
    this.drawRect(this.bounds)
    this.drawHandlerList()
    this.drawSub()
    this.ctx.restore()
  }

  drawRect (bounds: Bounds) {
    if (!this.ctx) {
      return
    }
    const { left, top, right, bottom } = bounds
    this.ctx.strokeStyle = this.strokeColor
    this.ctx.lineWidth = this.strokeWidth
    this.ctx.strokeRect(left, top, right - left, bottom - top)
  }

  drawHandler (x: number, y: number) {
    if (!this.ctx) {
      return
    }
    const width = 2 * this.handlerSize
    this.ctx.fillRect(x - this.handlerSize, y - this.handlerSize, width, width)
  }

  drawRotation () {
    if (!this.bounds || !this.ctx) {
      return
    }
    const { left, top, right } = this.bounds
    const centerX = left + (right - left) / 2
    const rotationY = top - 50
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, top)
    this.ctx.lineTo(centerX, rotationY)
    this.ctx.stroke()
    this.ctx.beginPath()
    this.ctx.arc(centerX, rotationY, this.handlerSize, 0, 2 * Math.PI)
    this.ctx.fill()
  }

  drawHandlerList () {
    if (!this.bounds || !this.ctx) {
      return
    }
    const { left, top, right, bottom } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    this.ctx.fillStyle = this.handlerFillColor
    this.drawHandler(left, top)
    this.drawHandler(right, top)
    this.drawHandler(left, bottom)
    this.drawHandler(right, bottom)
    this.drawHandler(centerX, top)
    this.drawHandler(centerX, bottom)
    this.drawHandler(left, centerY)
    this.drawHandler(right, centerY)
  }

  drawSub () {
    this.drawRotation()
  }

  setMode (mousePoint: Point) {
    if (!this.bounds) {
      return
    }
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
    } else if (dist(newMousePoint, point(centerX, top - 50)) <= this.handlerSize) {
      this.mode = HANDLER_POS.ROTATION
    } else if (x > left && y > top && x < right && y < bottom) {
      this.mode = HANDLER_POS.MOVE
    } else {
      this.mode = null
    }
  }

  changeResizeBounds (curPos: Point) {
    if (!this.bounds || !this.mode) {
      return
    }
    const { x, y } = convertPoint(curPos, this.bounds)
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

  changeMoveBounds ({ x: curPosX, y: curPosY }: Point, { x: prevPosX, y: prevPosY }: Point) {
    if (!this.bounds) {
      return
    }
    const { left, top, right, bottom, angle } = this.bounds
    const newBoundsX = left + (curPosX - prevPosX)
    const newBoundsY = top + (curPosY - prevPosY)
    this.setBounds({ left: newBoundsX, top: newBoundsY, right: newBoundsX + right - left, bottom: newBoundsY +  bottom - top, angle })
  }

  changeAngle ({ x, y }: Point) {
    if (!this.bounds) {
      return
    }
    const { left, top, right, bottom } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    this.setBounds({ left, top, right, bottom, angle: x > centerX ? 90 + (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI : 270 + (Math.atan2(centerY - y, centerX - x) * 180) / Math.PI })
  }
}
