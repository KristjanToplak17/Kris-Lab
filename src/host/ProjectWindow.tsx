import { Suspense, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { getPieceBySlug, lazyPieceComponents } from '../pieces/registry'
import type { PublicProjectEntry } from '../pieces/types'
import './host.css'

interface ProjectWindowProps {
  piece: PublicProjectEntry
  onClose: () => void
  onTitlebarPointerCancel?: (event: ReactPointerEvent<HTMLElement>) => void
  onTitlebarPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void
  onTitlebarPointerMove?: (event: ReactPointerEvent<HTMLElement>) => void
  onTitlebarPointerUp?: (event: ReactPointerEvent<HTMLElement>) => void
}

function ProjectLoading({ piece }: { piece: PublicProjectEntry }) {
  return (
    <div className="piece-loading piece-loading--window">
      <p className="piece-loading__eyebrow">Loading project</p>
      <h2>{piece.title}</h2>
    </div>
  )
}

export function ProjectWindow({
  piece,
  onClose,
  onTitlebarPointerCancel,
  onTitlebarPointerDown,
  onTitlebarPointerMove,
  onTitlebarPointerUp,
}: ProjectWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const PieceComponent = lazyPieceComponents[piece.slug]
  const pieceMeta = getPieceBySlug(piece.slug)

  useEffect(() => {
    windowRef.current?.focus()
  }, [piece.slug])

  if (!pieceMeta) {
    throw new Error(`Missing piece metadata for public project "${piece.slug}".`)
  }

  return (
    <section className="project-window-shell" aria-label={piece.title}>
      <div
        ref={windowRef}
        tabIndex={-1}
        className="project-window"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            onClose()
          }
        }}
      >
        <header
          className="shell-window__titlebar project-window__titlebar"
          data-window-drag-handle="titlebar"
          onPointerCancel={onTitlebarPointerCancel}
          onPointerDown={onTitlebarPointerDown}
          onPointerMove={onTitlebarPointerMove}
          onPointerUp={onTitlebarPointerUp}
        >
          <div className="shell-window__traffic project-window__traffic" data-window-control="traffic">
            <button
              type="button"
              className="project-window__close shell-window__traffic-light shell-window__traffic-light--close"
              data-window-control="close"
              onClick={onClose}
              aria-label={`Close ${piece.title}`}
            />
            <span
              className="shell-window__traffic-light shell-window__traffic-light--minimize"
              data-window-control="minimize"
              aria-hidden="true"
            />
            <span
              className="shell-window__traffic-light shell-window__traffic-light--maximize"
              data-window-control="maximize"
              aria-hidden="true"
            />
          </div>

          <div className="shell-window__title">{piece.title}</div>

          <div className="shell-window__title-spacer" aria-hidden="true" />
        </header>

        <section className="project-window__stage" aria-label={`${piece.title} viewport`}>
          <Suspense fallback={<ProjectLoading piece={piece} />}>
            <PieceComponent meta={pieceMeta} />
          </Suspense>
        </section>
      </div>
    </section>
  )
}
