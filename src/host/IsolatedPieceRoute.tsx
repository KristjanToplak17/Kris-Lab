import { useEffect, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { navigateToShell, type LabNavigationState } from '../lib/navigation'
import { getPageReveal } from '../lib/motion'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import type { PieceMeta } from '../pieces/types'

interface IsolatedPieceRouteProps {
  piece: PieceMeta
  children: ReactNode
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="piece-route__back-icon">
      <path
        d="M8.75 2.75L4.25 7L8.75 11.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IsolatedPieceRoute({ children }: IsolatedPieceRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const reducedMotion = usePrefersReducedMotion()
  const state = (location.state as LabNavigationState | null | undefined) ?? null

  useEffect(() => {
    document.body.dataset.pieceMode = 'isolated'

    return () => {
      delete document.body.dataset.pieceMode
    }
  }, [])

  return (
    <motion.main className="piece-isolated-route" {...getPageReveal(reducedMotion)}>
      <div className="piece-isolated-route__chrome">
        <button
          type="button"
          className="piece-route__back piece-route__back--isolated"
          onClick={() => navigateToShell(navigate, state)}
          aria-label="Back to Kris' Lab"
        >
          <ChevronLeftIcon />
          <span>Back</span>
        </button>
      </div>

      <section className="piece-isolated-route__viewport">{children}</section>
    </motion.main>
  )
}
