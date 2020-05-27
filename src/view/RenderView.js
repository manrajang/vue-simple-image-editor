export default class RenderView {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = true
    this.width = canvas.width
    this.height = canvas.height
    this.bounds = null
    this.renderBounds = null
  }
  // abstract
  draw () {}
  clearRect () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
  setBounds (bounds) {
    if (bounds) {
      this.bounds = { ...bounds }
      this.renderBounds = { ...bounds }
    } else {
      this.bounds = null
      this.renderBounds = null
    }
  }
}
