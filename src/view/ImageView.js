import RenderView from './RenderView'

export default class ImageView extends RenderView {
  constructor (canvas) {
    super(canvas)
    this.image = null
  }
  draw ({ x, y, width, height }) {
    if (this.image) {
      this.clearRect()
      this.ctx.save()
      this.ctx.drawImage(this.image, x, y, width, height)
      this.ctx.restore()
    }
  }
}
