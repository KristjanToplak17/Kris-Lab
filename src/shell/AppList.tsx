import { motion } from 'motion/react'
import { getListReveal } from '../lib/motion'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import type { PieceMeta } from '../pieces/types'

interface AppListProps {
  pieces: PieceMeta[]
  onOpenPiece: (piece: PieceMeta) => void
}

export function AppList({ pieces, onOpenPiece }: AppListProps) {
  const reducedMotion = usePrefersReducedMotion()

  if (!pieces.length) {
    return (
      <div className="shell-list__empty-state">
        <p className="shell-list__empty">No approved experiments are available yet.</p>
        <p className="shell-list__empty-copy">
          Approved work will appear here once a piece is ready for the shell.
        </p>
      </div>
    )
  }

  return (
    <ul className="shell-list shell-list--documents" role="list">
      {pieces.map((piece, index) => (
        <motion.li
          key={piece.slug}
          className="shell-list__item"
          {...getListReveal(reducedMotion, index)}
        >
          <button
            type="button"
            className="shell-list__link shell-list__link--button shell-list__link--document-row"
            onClick={() => {
              onOpenPiece(piece)
            }}
            onFocus={() => {
              void piece.importer()
            }}
            onMouseEnter={() => {
              void piece.importer()
            }}
          >
            <span className="shell-list__name shell-list__name--stacked shell-list__name--document">
              <span className="shell-list__icon shell-list__icon--document" aria-hidden="true" />
              <span className="shell-list__copy">
                <span className="shell-list__title">{piece.title}</span>
                <span className="shell-list__description">{piece.description}</span>
              </span>
            </span>
            <span className="shell-list__meta shell-list__meta--order" aria-hidden="true">
              <span className="shell-list__order">{piece.order.toString().padStart(2, '0')}</span>
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  )
}
