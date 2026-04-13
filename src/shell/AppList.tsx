import { AnimatePresence, motion } from 'motion/react'
import { getListReveal } from '../lib/motion'
import { shellEase } from '../lib/motion'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import type { PublicProjectEntry } from '../pieces/types'

interface AppListProps {
  pieces: PublicProjectEntry[]
  onOpenProject: (project: PublicProjectEntry) => void
}

const launcherContentEnterDuration = 140
const launcherContentExitDuration = 110

export function AppList({ pieces, onOpenProject }: AppListProps) {
  const reducedMotion = usePrefersReducedMotion()
  const hasPieces = pieces.length > 0

  const contentTransition = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 2 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: launcherContentEnterDuration / 1000, ease: shellEase },
        },
        exit: {
          opacity: 0,
          transition: { duration: launcherContentExitDuration / 1000, ease: shellEase },
        },
      }

  if (reducedMotion) {
    if (!pieces.length) {
      return (
        <div className="shell-list__empty-state">
          <p className="shell-list__empty">No public projects are available yet.</p>
          <p className="shell-list__empty-copy">
            Public projects will appear here once a project is ready for the shell.
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
                onOpenProject(piece)
              }}
              onFocus={() => {
                void piece.importer()
              }}
              onMouseEnter={() => {
                void piece.importer()
              }}
            >
              <span
                className="shell-list__name shell-list__name--stacked shell-list__name--document shell-list__name--document-no-icon"
              >
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

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={hasPieces ? 'launcher-content-populated' : 'launcher-content-empty'}
        className="shell-list-region"
        {...contentTransition}
      >
        {!pieces.length ? (
          <div className="shell-list__empty-state">
            <p className="shell-list__empty">No public projects are available yet.</p>
            <p className="shell-list__empty-copy">
              Public projects will appear here once a project is ready for the shell.
            </p>
          </div>
        ) : (
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
                    onOpenProject(piece)
                  }}
                  onFocus={() => {
                    void piece.importer()
                  }}
                  onMouseEnter={() => {
                    void piece.importer()
                  }}
                >
                  <span
                    className="shell-list__name shell-list__name--stacked shell-list__name--document shell-list__name--document-no-icon"
                  >
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
        )}
      </motion.div>
    </AnimatePresence>
  )
}
