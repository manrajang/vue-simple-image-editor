interface Bounds {
  left: number,
  top: number,
  right: number, 
  bottom: number,
  angle: number
}

interface Point {
  x: number,
  y: number
}

interface Style {
  strokeColor: string,
  strokeWidth: number,
  handlerFillColor: string,
  handlerSize: number,
  fillColor?: string,
  fillAlpha?: number
}