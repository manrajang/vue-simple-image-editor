import ResizeView from "./ResizeView";
import { HANDLER_POS } from "@/constants";

const DEFAULT_COLOR = "#C0C0C0";
const DEFAULT_FILL_ALPHA = 0.3;

export default class CropView extends ResizeView {
  public isFixedCrop = false;
  private fillColor = DEFAULT_COLOR;
  private fillAlpha = DEFAULT_FILL_ALPHA;

  constructor(canvas: HTMLCanvasElement, public boundaryBounds: Bounds) {
    super(canvas);
  }

  setStyle(style: Style) {
    const {
      fillColor = DEFAULT_COLOR,
      fillAlpha = DEFAULT_FILL_ALPHA,
      ...rest
    } = style;
    this.fillColor = fillColor;
    this.fillAlpha = fillAlpha;
    super.setStyle(rest);
  }

  draw() {
    if (!this.bounds) {
      return;
    }
    this.clearRect();
    super.draw();
  }
  // setBounds (bounds: IBounds) {
  //   this.bounds = bounds ? { ...bounds, angle: 0 } : null
  // }

  drawRect(bounds: Bounds) {
    if (!this.ctx) {
      return;
    }
    const { left, top, right, bottom } = bounds;
    const width = right - left;
    const height = bottom - top;
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.strokeRect(left, top, width, height);
    this.ctx.globalAlpha = this.fillAlpha;
    this.ctx.fillStyle = this.fillColor;
    this.ctx.fillRect(left, top, width, height);
    this.ctx.globalAlpha = 1;
  }

  drawSub() {
    this.drawLineList();
  }

  drawHandlerList() {
    if (!this.isFixedCrop) {
      super.drawHandlerList();
    }
  }

  drawLineList() {
    if (!this.bounds || !this.ctx) {
      return;
    }
    const { left, top, right, bottom } = this.bounds;
    const width = right - left;
    const height = bottom - top;
    let x = left + (width * 1) / 3;
    this.ctx.setLineDash([5, 5]);
    this.drawLine(x, top, x, bottom);
    x = left + (width * 2) / 3;
    this.drawLine(x, top, x, bottom);
    let y = top + (height * 1) / 3;
    this.drawLine(left, y, right, y);
    y = top + (height * 2) / 3;
    this.drawLine(left, y, right, y);
  }

  drawLine(mx: number, my: number, lx: number, ly: number) {
    if (!this.ctx) {
      return;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(mx, my);
    this.ctx.lineTo(lx, ly);
    this.ctx.stroke();
  }

  setMode(mousePoint: Point) {
    if (!this.bounds) {
      return;
    }
    if (this.isFixedCrop) {
      const { x: posX, y: posY } = mousePoint;
      const { left, top, right, bottom } = this.bounds;
      if (posX > left && posY > top && posX < right && posY < bottom) {
        this.mode = HANDLER_POS.MOVE;
      } else {
        this.mode = null;
      }
      return;
    }
    super.setMode(mousePoint);
    if (this.mode === HANDLER_POS.ROTATION) {
      this.mode = null;
    }
  }

  changeResizeBounds(mousePoint: Point) {
    if (!this.bounds || !this.mode) {
      return;
    }
    super.changeResizeBounds(mousePoint);
    const { x, y } = mousePoint;
    const {
      left: boundaryLeft,
      top: boundaryTop,
      right: boundaryRight,
      bottom: boundaryBottom
    } = this.boundaryBounds;
    const newBounds = { ...this.bounds };
    if ((this.mode & HANDLER_POS.LEFT) === HANDLER_POS.LEFT) {
      if (x < boundaryLeft) {
        newBounds.left = boundaryLeft;
      }
    }
    if ((this.mode & HANDLER_POS.TOP) === HANDLER_POS.TOP) {
      if (y < boundaryTop) {
        newBounds.top = boundaryTop;
      }
    }
    if ((this.mode & HANDLER_POS.RIGHT) === HANDLER_POS.RIGHT) {
      if (x > boundaryRight) {
        newBounds.right = boundaryRight;
      }
    }
    if ((this.mode & HANDLER_POS.BOTTOM) === HANDLER_POS.BOTTOM) {
      if (y > boundaryBottom) {
        newBounds.bottom = boundaryBottom;
      }
    }
    this.setBounds(newBounds);
  }

  changeMoveBounds(
    { x: curPosX, y: curPosY }: Point,
    { x: prevPosX, y: prevPosY }: Point
  ) {
    if (!this.bounds) {
      return;
    }
    const { left, top, right, bottom } = this.bounds;
    const {
      left: boundaryLeft,
      top: boundaryTop,
      right: boundaryRight,
      bottom: boundaryBottom
    } = this.boundaryBounds;
    const width = right - left;
    const height = bottom - top;
    let newBoundsX = left + (curPosX - prevPosX);
    let newBoundsY = top + (curPosY - prevPosY);
    if (left < boundaryLeft) {
      newBoundsX = boundaryLeft;
    }
    if (newBoundsY < boundaryTop) {
      newBoundsY = boundaryTop;
    }
    if (newBoundsX + width > boundaryRight) {
      newBoundsX = boundaryRight - width;
    }
    if (newBoundsY + height > boundaryBottom) {
      newBoundsY = boundaryBottom - height;
    }
    this.setBounds({
      left: newBoundsX,
      top: newBoundsY,
      right: newBoundsX + width,
      bottom: newBoundsY + height,
      angle: 0
    });
  }
}
