import ResizeView from './ResizeView'

export default class CropView extends ResizeView {
  draw () {
    if (!this.bounds) {
      return
    }
    this.clearRect()
    super.draw()
    const { left, top, right, bottom } = this.bounds
    const width = right - left
    const height = bottom - top
    this.ctx.save()
    this.ctx.globalAlpha = 0.1
    this.ctx.fillStyle = '#C0C0C0'
    this.ctx.fillRect(left, top, width, height)
    this.ctx.restore()
  }
}
