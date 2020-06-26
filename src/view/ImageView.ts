import RenderView from './RenderView'
import { rotate, applyToPoint } from '@/matrixUtil'

function convertPoint ({ x, y }: Point, { left, top, right, bottom, angle }: Bounds) {
  return applyToPoint(rotate(angle * Math.PI / 180, (right - left) / 2, (bottom - top) / 2), { x, y })
}

interface MSHTMLCanvasElement extends HTMLCanvasElement {
  msToBlob?: (type: string) => Blob;
}

export default class ImageView extends RenderView {
  public image: HTMLImageElement | null

  constructor (canvas: HTMLCanvasElement) {
    super(canvas)
    this.image = null
  }

  draw () {
    if (!this.image || !this.bounds || !this.ctx) {
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

  crop ({ left: cropLeft, top: cropTop, right: cropRight, bottom: cropBottom }: Bounds) {
    return new Promise((resolve, reject) => {
      if (!this.image) {
        reject(new Error('No Image'))
        return
      }
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No Canvas Context'))
        return
      }
      const width = cropRight - cropLeft
      const height = cropBottom - cropTop
      canvas.width = width
      canvas.height = height
      ctx.drawImage(this.canvas, cropLeft, cropTop, width, height, 0, 0, width, height)
      this.image.onload = () => resolve()
      this.image.onerror = reject
      this.image.src = canvas.toDataURL()
    })
  }

  createResizeCanvas (): HTMLCanvasElement | null {
    if (!this.bounds || !this.image) {
      return null
    }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return null
    }
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
      if (!this.image) {
        reject(new Error('No Image'))
        return
      }
      const canvas = this.createResizeCanvas()
      if (!canvas) {
        reject(new Error('No Canvas'))
        return
      }
      this.image.onload = () => resolve()
      this.image.onerror = reject
      this.image.src = canvas.toDataURL()
    })
  }

  saveFile (fileName = 'imageFile') {
    const canvas = this.createResizeCanvas()
    if (!canvas) {
      return
    }
    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        if (blob) {
          const downloadLink = document.createElement('a')
          const url = URL.createObjectURL(blob)
          downloadLink.download = `${fileName}.jpeg`
          downloadLink.setAttribute('style', 'display:none;')
          downloadLink.setAttribute('download', `${fileName}.jpeg`)
          downloadLink.setAttribute('href', url)
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
          URL.revokeObjectURL(url)
        }
      }, 'image/jpeg')
    } else {
      const newCanvas = canvas as MSHTMLCanvasElement
      if (newCanvas.msToBlob) {
        window.navigator.msSaveBlob(newCanvas.msToBlob('image/jpeg'), 'canvas.png')
      }
    }
  }
}
