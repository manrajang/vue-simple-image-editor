import ImageView from '@/view/ImageView'
import ResizeView from '@/view/ResizeView'
import CropView from '@/view/CropView'
import { HANDLER_POS, EDIT_MODE } from '@/constants'

function createCanvas (width, height, style = null) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.setAttribute('style', style)
  return canvas
}

function loadImage (src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export default class ImageEditor {
  constructor (el, { width = 500, height = 500, cropWidth = 0, cropHeight = 0 }) {
    this.el = el
    this.width = width
    this.height = height
    this.cropWidth = cropWidth
    this.cropHeight = cropHeight
    this.el.setAttribute('style', `${this.el.getAttribute('style')}position:relative;display:inline-block;`)
    this.viewCanvas = createCanvas(width, height)
    this.cropCanvas = createCanvas(width, height, 'position:absolute;left:0;top:0;')
    this.fragment = document.createDocumentFragment()
    this.fragment.appendChild(this.viewCanvas)
    this.fragment.appendChild(this.cropCanvas)
    this.imageView = new ImageView(this.viewCanvas)
    this.resizeView = new ResizeView(this.viewCanvas)
    this.cropView = new CropView(this.cropCanvas, { left: 0, top: 0, right: width, bottom: height })
    this.onMouseDown = this._onMouseDown.bind(this)
    this.onMouseMove = this._onMouseMove.bind(this)
    this.onMouseUp = this._onMouseUp.bind(this)
    this.eventList = [
      { key: 'mousedown', event: this.onMouseDown },
      { key: 'mousemove', event: this.onMouseMove },
      { key: 'mouseup', event: this.onMouseUp },
      { key: 'touchstart', event: this.onMouseDown },
      { key: 'touchmove', event: this.onMouseMove },
      { key: 'touchend', event: this.onMouseUp },
    ]
    this.editMode = EDIT_MODE.NONE
    this.prevPos = null
    this.isCrop = false
    this.addEventListener()
  }
  addEventListener () {
    this.eventList.forEach(({ key, event }) => {
      this.viewCanvas.addEventListener(key, event)
      this.cropCanvas.addEventListener(key, event)
    })
  }
  removeEventListener () {
    this.eventList.forEach(({ key, event }) => {
      this.viewCanvas.removeEventListener(key, event)
      this.cropCanvas.removeEventListener(key, event)
    })
  }
  init () {
    if (!this.el.contains(this.viewCanvas)) {
      if (this.el.hasChildNodes()) {
        this.el.insertBefore(this.fragment, this.el.childNodes[0])
      } else {
        this.el.appendChild(this.fragment)
      }
    }
  }
  setImage (image) {
    this.imageView.image = image
    if (image) {
      const { width, height } = image
      const x = (this.width - width) / 2
      const y = (this.height - height) / 2
      const bounds = { left: x, top: y, right: x + width, bottom: y + height, angle: 0 }
      let cropBounds = bounds
      if (this.cropWidth && this.cropHeight && this.cropWidth < width && this.cropHeight < height) {
        const x = (this.width - this.cropWidth) / 2
        const y = (this.height - this.cropHeight) / 2
        cropBounds = { left: x, top: y, right: x + this.cropWidth, bottom: y + this.cropHeight }
      }
      this.imageView.setBounds(bounds)
      this.resizeView.setBounds(bounds)
      this.cropView.setBounds(cropBounds)
      this.render()
    } else {
      this.imageView.setBounds(null)
      this.resizeView.setBounds(null)
      this.cropView.setBounds(null)
      this.imageView.clearRect()
      this.resizeView.clearRect()
      this.cropView.clearRect()
    }
  }
  setImagePath (path) {
    loadImage(path).then(image => this.setImage(image))
  }
  setCrop (isCrop) {
    this.isCrop = isCrop
    this.cropCanvas.style.visibility = isCrop ? 'visible' : 'hidden'
    this.render()
  }
  setFixedCrop (isFixedCrop) {
    this.cropView.isFixedCrop = isFixedCrop
  }
  getPos (event) {
    const { pageX, pageY } = event.touches && event.touches.length > 0 ? event.touches[0] : event
    const { offsetLeft, offsetTop } = this.el
    return { x: pageX - offsetLeft, y: pageY - offsetTop }
  }
  getTrackerView () {
    return this.isCrop ? this.cropView : this.resizeView
  }
  getImage () {
    return this.imageView.image
  }
  resize () {
    this.imageView.resize()
  }
  saveImageFile (fileName) {
    this.imageView.saveFile(fileName)
  }
  crop () {
    const bounds = { ...this.cropView.bounds }
    this.imageView.crop(bounds)
    this.imageView.setBounds(bounds)
    this.resizeView.setBounds(bounds)
  }
  render () {
    this.imageView.draw()
    this.getTrackerView().draw()
  }
  _onMouseDown (event) {
    const curPos = this.getPos(event)
    const trackerView = this.getTrackerView()
    trackerView.setMode(curPos)
    const { mode } = trackerView
    if (mode == null) {
      this.editMode = EDIT_MODE.NONE
    } else {
      window.addEventListener('mousemove', this.onMouseMove)
      window.addEventListener('mouseup', this.onMouseUp)
      if (mode === HANDLER_POS.MOVE) {
        this.editMode = EDIT_MODE.MOVE
      } else if (mode === HANDLER_POS.ROTATION) {
        this.editMode = EDIT_MODE.ROTATION
      } else {
        this.editMode = EDIT_MODE.RESIZE
      }
      this.prevPos = curPos
      event.preventDefault()
    }
  }
  _onMouseMove (event) {
    if (this.editMode !== EDIT_MODE.NONE) {
      const curPos = this.getPos(event)
      const trackerView = this.getTrackerView()
      if (this.editMode === EDIT_MODE.RESIZE) {
        trackerView.changeResizeBounds(curPos)
      } else if (this.editMode === EDIT_MODE.MOVE) {
        trackerView.changeMoveBounds(curPos, this.prevPos)
      } else if (this.editMode === EDIT_MODE.ROTATION) {
        trackerView.changeAngle(curPos)
      }
      if (!this.isCrop) {
        this.imageView.setBounds(this.resizeView.bounds)
      }
      this.render()
      this.prevPos = curPos
      event.preventDefault()
    }
  }
  _onMouseUp (event) {
    if (this.editMode !== EDIT_MODE.NONE) {
      this.resizeView.mode = null
      this.cropView.mode = null
      this.editMode = EDIT_MODE.NONE
      this.prevPos = null
      event.preventDefault()
    }
    window.removeEventListener('mousemove', this.onDocumentMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
  }
}
