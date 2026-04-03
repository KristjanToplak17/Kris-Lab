import { Suspense, useEffect, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { navigateToShell, type LabNavigationState } from '../lib/navigation'
import { getPageReveal } from '../lib/motion'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import { getPieceBySlug, lazyPieceComponents } from '../pieces/registry'
import type { PieceMeta } from '../pieces/types'
import { IsolatedPieceRoute } from './IsolatedPieceRoute'
import './host.css'

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

function StatusPill({ status }: { status: PieceMeta['status'] }) {
  if (status === 'approved') {
    return null
  }

  return <span className="piece-status-pill">{status}</span>
}

function PieceLoading({ piece }: { piece: PieceMeta }) {
  return (
    <div className="piece-loading">
      <p className="piece-loading__eyebrow">Loading piece</p>
      <h2>{piece.title}</h2>
    </div>
  )
}

function PieceUnavailable() {
  return (
    <main className="piece-unavailable">
      <div className="piece-unavailable__card">
        <p className="piece-unavailable__eyebrow">Missing piece</p>
        <h1>This experiment is not registered.</h1>
        <p>The route exists, but no piece metadata matches the requested slug.</p>
      </div>
    </main>
  )
}

interface PieceRouteLayoutProps {
  piece: PieceMeta
  children: ReactNode
}

export function PieceHostRoute({ piece, children }: PieceRouteLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const reducedMotion = usePrefersReducedMotion()
  const state = (location.state as LabNavigationState | null | undefined) ?? null

  useEffect(() => {
    document.body.dataset.pieceMode = 'hosted'

    return () => {
      delete document.body.dataset.pieceMode
    }
  }, [])

  return (
    <motion.main className="piece-route" {...getPageReveal(reducedMotion)}>
      <header className="piece-route__chrome">
        <button
          type="button"
          className="piece-route__back"
          onClick={() => navigateToShell(navigate, state)}
          aria-label="Back to Kris' Lab"
        >
          <ChevronLeftIcon />
          <span>Back to lab</span>
        </button>

        <div className="piece-route__meta">
          <p className="piece-route__eyebrow">Hosted piece</p>
          <h1>{piece.title}</h1>
          <p>{piece.description}</p>
        </div>

        <div className="piece-route__chrome-meta">
          <span className="piece-stage-pill">Hosted stage</span>
          <StatusPill status={piece.status} />
        </div>
      </header>

      <section className="piece-route__viewport">{children}</section>
    </motion.main>
  )
}

export function PieceRouteEntry() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const piece = slug ? getPieceBySlug(slug) : undefined
  const state = (location.state as LabNavigationState | null | undefined) ?? null

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      navigateToShell(navigate, state)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate, state])

  useEffect(() => {
    document.title = piece ? `${piece.title} - Kris' Lab` : "Missing Piece - Kris' Lab"
  }, [piece])

  if (!piece) {
    return <PieceUnavailable />
  }

  const PieceComponent = lazyPieceComponents[piece.slug]

  const renderedPiece = (
    <Suspense fallback={<PieceLoading piece={piece} />}>
      <PieceComponent meta={piece} />
    </Suspense>
  )

  if (piece.mode === 'isolated') {
    return <IsolatedPieceRoute piece={piece}>{renderedPiece}</IsolatedPieceRoute>
  }

  return <PieceHostRoute piece={piece}>{renderedPiece}</PieceHostRoute>
}
