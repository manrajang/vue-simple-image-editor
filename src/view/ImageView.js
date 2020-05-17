import RenderView from './RenderView'

export default class ImageView extends RenderView {
  constructor (canvas) {
    super(canvas)
    this.image = null
  }
  draw ({ left, top, right, bottom }) {
    if (this.image) {
      this.clearRect()
      this.ctx.save()
      this.ctx.drawImage(this.image, left, top, right - left, bottom - top)
      this.ctx.restore()
    }
  }
  crop ({ x, y, width, height }) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(this.image, x, y, width, height, 0, 0, width, height)
    this.image.src = canvas.toDataURL()
  }
  saveFile ({ left, top, right, bottom }) {
    const width = right - left
    const height = bottom - top
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
