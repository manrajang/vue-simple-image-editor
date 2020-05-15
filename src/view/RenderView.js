export default class RenderView {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = true
    this.width = canvas.width
    this.height = canvas.height
  }
  draw (bounds) {
    console.log(bounds)
  }
  drawImage (img, { x, y, width, height }) {
    this.ctx.save()
    this.ctx.drawImage(img, x, y, width, height)
    this.ctx.restore()
  }
  drawRect ({ x, y, width, height }) {
    this.ctx.beginPath()
    this.ctx.fillRect(x, y, width, height)
    this.ctx.closePath()
  }
  drawFree (pathList) {
    this.ctx.beginPath()
    pathList.forEach(path => {
      const { x, y } = path.pos
      if (path.type === 'm') {
        this.ctx.moveTo(x, y)
      } else if (path.type === 'l') {
        this.ctx.lineTo(x, y)
      }
      this.ctx.stroke()
    })
    this.ctx.closePath()
  }
  clearRect () {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }
}
