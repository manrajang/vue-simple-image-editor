import ImageView from "@/view/ImageView";
import ResizeView from "@/view/ResizeView";
import CropView from "@/view/CropView";
import { HANDLER_POS, EDIT_MODE } from "@/constants";

interface Option {
  width: number;
  height: number;
  cropWidth: number;
  cropHeight: number;
}

interface MouseEventFunc {
  (event: Event): void;
}

function createCanvas(
  width: number,
  height: number,
  style?: string
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute("style", style || "");
  return canvas;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export default class ImageEditor {
  private width: number;
  private height: number;
  private cropWidth: number;
  private cropHeight: number;
  private viewCanvas: HTMLCanvasElement;
  private cropCanvas: HTMLCanvasElement;
  private fragment: DocumentFragment;
  private imageView: ImageView;
  private resizeView: ResizeView;
  private cropView: CropView;
  private editMode = EDIT_MODE.NONE;
  private prevPos: Point | null = null;
  private isCrop = false;

  private readonly windowEventList = [
    {
      key: "mousemove",
      event: (event: Event) => this.onMove(event, this.getMousePos(event))
    },
    { key: "mouseup", event: (event: Event) => this.onUp(event) },
    {
      key: "touchmove",
      event: (event: Event) => this.onMove(event, this.getTouchPos(event))
    },
    { key: "touchend", event: (event: Event) => this.onUp(event) }
  ];

  private readonly eventList = [
    ...this.windowEventList,
    {
      key: "mousedown",
      event: (event: Event) => this.onDown(event, this.getMousePos(event))
    },
    {
      key: "touchstart",
      event: (event: Event) => this.onDown(event, this.getTouchPos(event))
    }
  ];

  constructor(
    public el: HTMLElement,
    { width = 500, height = 500, cropWidth = 0, cropHeight = 0 }: Option
  ) {
    this.width = width;
    this.height = height;
    this.cropWidth = cropWidth;
    this.cropHeight = cropHeight;
    this.el.setAttribute(
      "style",
      `${this.el.getAttribute("style")}position:relative;display:inline-block;`
    );
    this.viewCanvas = createCanvas(width, height);
    this.cropCanvas = createCanvas(
      width,
      height,
      "position:absolute;left:0;top:0;"
    );
    this.fragment = document.createDocumentFragment();
    this.fragment.appendChild(this.viewCanvas);
    this.fragment.appendChild(this.cropCanvas);
    this.imageView = new ImageView(this.viewCanvas);
    this.resizeView = new ResizeView(this.viewCanvas);
    this.cropView = new CropView(this.cropCanvas, {
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      angle: 0
    });
    this.addEventListener();
  }

  addEventListener() {
    this.eventList.forEach(({ key, event }) => {
      this.viewCanvas.addEventListener(key, event as MouseEventFunc);
      this.cropCanvas.addEventListener(key, event as MouseEventFunc);
    });
  }

  removeEventListener() {
    this.eventList.forEach(({ key, event }) => {
      this.viewCanvas.removeEventListener(key, event as MouseEventFunc);
      this.cropCanvas.removeEventListener(key, event as MouseEventFunc);
    });
  }

  init() {
    if (!this.el.contains(this.viewCanvas)) {
      if (this.el.hasChildNodes()) {
        this.el.insertBefore(this.fragment, this.el.childNodes[0]);
      } else {
        this.el.appendChild(this.fragment);
      }
    }
  }

  setImage(image: HTMLImageElement) {
    this.imageView.image = image;
    if (image) {
      const { width, height } = image;
      const x = (this.width - width) / 2;
      const y = (this.height - height) / 2;
      const bounds = {
        left: x,
        top: y,
        right: x + width,
        bottom: y + height,
        angle: 0
      };
      let cropBounds: Bounds;
      if (
        this.cropWidth &&
        this.cropHeight &&
        this.cropWidth < width &&
        this.cropHeight < height
      ) {
        const x = (this.width - this.cropWidth) / 2;
        const y = (this.height - this.cropHeight) / 2;
        cropBounds = {
          left: x,
          top: y,
          right: x + this.cropWidth,
          bottom: y + this.cropHeight,
          angle: 0
        };
      } else {
        cropBounds = bounds;
      }
      this.imageView.setBounds(bounds);
      this.resizeView.setBounds(bounds);
      this.cropView.setBounds(cropBounds);
      this.render();
    } else {
      this.imageView.setBounds(null);
      this.resizeView.setBounds(null);
      this.cropView.setBounds(null);
      this.imageView.clearRect();
      this.resizeView.clearRect();
      this.cropView.clearRect();
    }
  }

  setImagePath(path: string) {
    loadImage(path).then(image => this.setImage(image));
  }

  setCrop(isCrop: boolean) {
    this.isCrop = isCrop;
    this.cropCanvas.style.visibility = isCrop ? "visible" : "hidden";
    this.render();
  }

  setFixedCrop(isFixedCrop: boolean) {
    this.cropView.isFixedCrop = isFixedCrop;
  }

  getTouchPos(event: Event): Point {
    let pageX;
    let pageY;
    const { touches } = event as TouchEvent;
    if (touches && touches.length) {
      pageX = touches[0].pageX;
      pageY = touches[0].pageY;
    } else {
      pageX = 0;
      pageY = 0;
    }
    const { offsetLeft, offsetTop } = this.el;
    return { x: pageX - offsetLeft, y: pageY - offsetTop };
  }

  getMousePos(event: Event): Point {
    const { pageX, pageY } = event as MouseEvent;
    const { offsetLeft, offsetTop } = this.el;
    return { x: pageX - offsetLeft, y: pageY - offsetTop };
  }

  getTrackerView(): ResizeView {
    return this.isCrop ? this.cropView : this.resizeView;
  }

  getImage(): HTMLImageElement | null {
    return this.imageView.image;
  }

  resize() {
    return new Promise((resolve, reject) =>
      this.imageView
        .resize()
        .then(() => resolve())
        .catch(() => reject(new Error("Fail Resize")))
    );
  }

  saveImageFile(fileName: string) {
    this.imageView.saveFile(fileName);
  }

  crop() {
    const { bounds } = this.cropView;
    if (!bounds) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.imageView
        .crop(bounds)
        .then(() => {
          this.imageView.setBounds(bounds);
          this.resizeView.setBounds(bounds);
          resolve();
        })
        .catch(() => reject(new Error("Fail Crop")));
    });
  }

  render() {
    this.imageView.draw();
    this.getTrackerView().draw();
  }

  onDown(event: Event, curPos: Point) {
    const trackerView = this.getTrackerView();
    trackerView.setMode(curPos);
    const { mode } = trackerView;
    if (mode == null) {
      this.editMode = EDIT_MODE.NONE;
    } else {
      this.windowEventList.forEach(({ key, event }) =>
        window.addEventListener(key, event as MouseEventFunc)
      );
      if (mode === HANDLER_POS.MOVE) {
        this.editMode = EDIT_MODE.MOVE;
      } else if (mode === HANDLER_POS.ROTATION) {
        this.editMode = EDIT_MODE.ROTATION;
      } else {
        this.editMode = EDIT_MODE.RESIZE;
      }
      this.prevPos = curPos;
      event.preventDefault();
    }
  }

  onMove(event: Event, curPos: Point) {
    if (this.editMode !== EDIT_MODE.NONE) {
      const trackerView = this.getTrackerView();
      if (this.editMode === EDIT_MODE.RESIZE) {
        trackerView.changeResizeBounds(curPos);
      } else if (this.editMode === EDIT_MODE.MOVE) {
        if (this.prevPos) {
          trackerView.changeMoveBounds(curPos, this.prevPos);
        }
      } else if (this.editMode === EDIT_MODE.ROTATION) {
        trackerView.changeAngle(curPos);
      }
      if (!this.isCrop) {
        this.imageView.setBounds(this.resizeView.bounds);
      }
      this.render();
      this.prevPos = curPos;
      event.preventDefault();
    }
  }

  onUp(event: Event) {
    if (this.editMode !== EDIT_MODE.NONE) {
      this.resizeView.mode = null;
      this.cropView.mode = null;
      this.editMode = EDIT_MODE.NONE;
      this.prevPos = null;
      event.preventDefault();
    }
    this.windowEventList.forEach(({ key, event }) =>
      window.removeEventListener(key, event as MouseEventFunc)
    );
  }

  setStyle(resizeHandlerStyle: Style, cropHandlerStyle: Style) {
    this.resizeView.setStyle(resizeHandlerStyle);
    this.cropView.setStyle(cropHandlerStyle);
  }
}
