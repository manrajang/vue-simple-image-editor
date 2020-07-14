export default abstract class RenderView {
  protected ctx: CanvasRenderingContext2D | null;
  protected width: number;
  protected height: number;
  public bounds: Bounds | null;

  constructor(public canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
    }
    this.width = canvas.width;
    this.height = canvas.height;
    this.bounds = null;
  }

  abstract draw(): void;

  clearRect() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  setBounds(bounds: Bounds | null) {
    this.bounds = bounds ? { ...bounds } : null;
  }
}
