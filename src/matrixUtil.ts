const { cos, sin } = Math

interface Matrix {
  a: number; c: number; e: number;
  b: number; d: number; f: number;
}

function translate (tx: number, ty: number): Matrix {
  return {
    a: 1,
    c: 0,
    e: tx,
    b: 0,
    d: 1,
    f: ty
  }
}

function multiply (m1: Matrix, m2: Matrix): Matrix {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    b: m1.b * m2.a + m1.d * m2.b,
    d: m1.b * m2.c + m1.d * m2.d,
    f: m1.b * m2.e + m1.d * m2.f + m1.f
  }
}

export function transform (matrices: Matrix[]): Matrix {
  switch (matrices.length) {
    case 0:
      throw new Error('No Matrix')
    case 1:
      return matrices[0]
    case 2:
      return multiply(matrices[0], matrices[1])
    default: {
      const [m1, m2, ...rest] = matrices
      return transform([multiply(m1, m2), ...rest])
    }
  }
}

export function rotate (angle: number, cx: number, cy: number): Matrix {
  const cosAngle = cos(angle)
  const sinAngle = sin(angle)
  const rotationMatrix = {
    a: cosAngle,
    c: -sinAngle,
    e: 0,
    b: sinAngle,
    d: cosAngle,
    f: 0
  }
  return transform([
    translate(cx, cy),
    rotationMatrix,
    translate(-cx, -cy)
  ])
}

export function applyToPoint (matrix: Matrix, point: Point) {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f
  }
}
