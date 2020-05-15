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
  saveFile ({ width, height }) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(this.image, 0, 0, width, height)
    canvas.toBlob(function (blob) {
      const downloadLink = document.createElement('a')
      downloadLink.href = URL.createObjectURL(blob)
      downloadLink.download = 'test.jpeg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }, 'image/jpeg')
  }
}
