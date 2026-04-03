import { Suspense, useEffect, useRef } from 'react'
import { lazyPieceComponents } from '../pieces/registry'
import type { PieceMeta } from '../pieces/types'
import './host.css'

interface ProjectWindowProps {
  piece: PieceMeta
  onClose: () => void
}

function ProjectLoading({ piece }: { piece: PieceMeta }) {
  return (
    <div className="piece-loading piece-loading--window">
      <p className="piece-loading__eyebrow">Loading stage</p>
      <h2>{piece.title}</h2>
    </div>
  )
}

export function ProjectWindow({ piece, onClose }: ProjectWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const PieceComponent = lazyPieceComponents[piece.slug]

  useEffect(() => {
    windowRef.current?.focus()
  }, [piece.slug])

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
        <header className="shell-window__titlebar project-window__titlebar">
          <div className="shell-window__traffic project-window__traffic">
            <button
              type="button"
              className="project-window__close shell-window__traffic-light shell-window__traffic-light--close"
              onClick={onClose}
              aria-label={`Close ${piece.title}`}
            />
            <span
              className="shell-window__traffic-light shell-window__traffic-light--minimize"
              aria-hidden="true"
            />
            <span
              className="shell-window__traffic-light shell-window__traffic-light--maximize"
              aria-hidden="true"
            />
          </div>

          <div className="shell-window__title">{piece.title}</div>

          <div className="shell-window__title-spacer" aria-hidden="true" />
        </header>

        <section className="project-window__stage" aria-label={`${piece.title} viewport`}>
          <Suspense fallback={<ProjectLoading piece={piece} />}>
            <PieceComponent meta={piece} />
          </Suspense>
        </section>
      </div>
    </section>
  )
}
