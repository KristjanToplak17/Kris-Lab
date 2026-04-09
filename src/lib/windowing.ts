export interface DesktopBounds {
  width: number
  height: number
}

export interface WindowRect {
  x: number
  y: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function clampRectToBounds(
  rect: WindowRect,
  bounds: DesktopBounds,
  edgeInset = 0,
): WindowRect {
  const safeInset = Math.max(edgeInset, 0)
  const maxWidth = Math.max(bounds.width - safeInset * 2, 0)
  const maxHeight = Math.max(bounds.height - safeInset * 2, 0)
  const width = Math.min(rect.width, maxWidth)
  const height = Math.min(rect.height, maxHeight)
  const minX = Math.min(safeInset, Math.max(bounds.width - width, 0))
  const minY = Math.min(safeInset, Math.max(bounds.height - height, 0))
  const maxX = Math.max(bounds.width - width - safeInset, minX)
  const maxY = Math.max(bounds.height - height - safeInset, minY)

  return {
    x: clamp(rect.x, minX, maxX),
    y: clamp(rect.y, minY, maxY),
    width,
    height,
  }
}

export function moveIdToEnd(ids: string[], id: string) {
  const next = ids.filter((candidate) => candidate !== id)
  next.push(id)
  return next
}

export function rectEquals(a: WindowRect | null | undefined, b: WindowRect | null | undefined) {
  if (!a || !b) {
    return false
  }

  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}
