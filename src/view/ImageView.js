import RenderView from './RenderView'
import { rotate, compose, applyToPoint } from 'transformation-matrix'

function convertPoint ({ x, y }, { left, top, right, bottom, angle }) {
  return applyToPoint(compose(rotate(angle * Math.PI / 180, (right - left) / 2, (bottom - top) / 2)), { x, y })
}

export default class ImageView extends RenderView {
  constructor (canvas) {
    super(canvas)
    this.image = null
  }
  draw () {
    if (!this.image) {
      return
    }
    const { left, top, right, bottom, angle } = this.bounds
    const centerX = left + (right - left) / 2
    const centerY = top + (bottom - top) / 2
    this.clearRect()
    this.ctx.save()
    this.ctx.translate(centerX, centerY)
    this.ctx.rotate(angle * Math.PI / 180)
    this.ctx.translate(-centerX, -centerY)
    this.ctx.drawImage(this.image, left, top, right - left, bottom - top)
    this.ctx.restore()
  }
  crop ({ left: cropLeft, top: cropTop, right: cropRight, bottom: cropBottom }) {
    return new Promise((resolve, reject) => {
      const width = cropRight - cropLeft
      const height = cropBottom - cropTop
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(this.canvas, cropLeft, cropTop, width, height, 0, 0, width, height)
      this.image.onload = () => resolve()
      this.image.onerror = reject
      this.image.src = canvas.toDataURL()
    })
  }
  createResizeCanvas () {
    const { left, top, right, bottom, angle } = this.bounds
    const width = right - left
    const height = bottom - top
    const centerX = width / 2
    const centerY = height / 2
    const lt = convertPoint({ x: 0, y: 0 }, this.bounds)
    const lb = convertPoint({ x: 0, y: height }, this.bounds)
    const rt = convertPoint({ x: width, y: 0 }, this.bounds)
    const rb = convertPoint({ x: width, y: height }, this.bounds)
    const l = Math.min(lt.x, lb.x, rt.x, rb.x)
    const t = Math.min(lt.y, lb.y, rt.y, rb.y)
    const r = Math.max(lt.x, lb.x, rt.x, rb.x)
    const b = Math.max(lt.y, lb.y, rt.y, rb.y)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = r - l
    canvas.height = b - t
    ctx.translate(Math.abs(l) + centerX, Math.abs(t) + centerY)
    ctx.rotate(angle * Math.PI / 180)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(this.image, 0, 0, width, height)
    return canvas
  }
  resize () {
    return new Promise((resolve, reject) => {
      this.image.onload = () => resolve()
      this.image.onerror = reject
      this.image.src = this.createResizeCanvas().toDataURL()
    })
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
