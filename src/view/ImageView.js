import RenderView from './RenderView'

export default class ImageView extends RenderView {
  constructor (canvas) {
    super(canvas)
    this.image = null
  }
  draw () {
    if (!this.image) {
      return
    }
    const { left: renderL, top: renderT, right: renderR, bottom: renderB } = this.renderBounds
    const { left, top, right, bottom, angle } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    this.clearRect()
    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(angle * Math.PI / 180)
    this.ctx.translate(-centerX, -centerY)
    this.ctx.drawImage(this.image, renderL, renderT, renderR - renderL, renderB - renderT)
    this.ctx.restore()
  }
  crop (cropBounds) {
    const { left, top } = this.bounds
    const { left: cropLeft, top: cropTop, right: cropRight, bottom: cropBottom } = cropBounds
    const width = cropRight - cropLeft
    const height = cropBottom - cropTop
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(this.image, cropLeft - left, cropTop - top, width, height, 0, 0, width, height)
    this.image.src = canvas.toDataURL()
    this.bounds = { left: cropLeft, top: cropTop, right: cropRight, bottom: cropBottom }
  }
  createResizeCanvas () {
    const { left, top, right, bottom } = this.bounds
    const width = right - left
    const height = bottom - top
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(this.image, 0, 0, width, height)
    return canvas
  }
  resize () {
    this.image.src = this.createResizeCanvas().toDataURL()
  }
  saveFile (fileName = 'imageFile') {
    this.createResizeCanvas().toBlob(function (blob) {
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = `${fileName}.jpeg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }, 'image/jpeg')
  }
}
