import type { CSSProperties, KeyboardEvent } from 'react'
import { useMemo, useState } from 'react'
import { usePrefersReducedMotion } from '../../lib/reduced-motion'
import type { PieceComponentProps } from '../types'
import './piece.css'

const ROLLIN_SEARCH_SPEC = {
  closedBallSize: 42,
  openWidth: 234,
  openHeight: 44,
  trackRadius: 48,
  ballTravel: 96,
  closedBallLeft: 92,
  ballDockInset: 0.5,
  accentWidth: 1,
  accentHeight: 20,
  accentInsetLeft: 16,
  accentInsetTop: 6,
  labelInsetLeft: 4,
  labelReadableAt: 0.01,
  contentHeight: 28,
  contentInsetTop: 6,
  contentMaxWidth: 202,
  highlightSize: 16,
  highlightOffsetX: 8,
  highlightOffsetY: 4,
  largeShadowSize: 32,
  largeShadowOffsetX: 4,
  largeShadowOffsetY: 10,
  smallShadowWidth: 20,
  smallShadowHeight: 19,
  smallShadowOffsetX: 11,
  smallShadowOffsetY: 23,
  faceSize: 26,
  faceCycle: 72,
  faceCenterOffsetX: 8,
  faceCenterOffsetY: 8,
  indicatorBlinkDurationMs: 2000,
  indicatorFadeOutDurationMs: 90,
  settleDelayRatio: 0.4,
  openDurationMs: 820,
  closeDurationMs: 820,
  reducedMotionDurationMs: 80,
  ease: 'cubic-bezier(0.38, 0.4, 0.6, 0.94)',
} as const

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12H18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M12 6L18 12L12 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="10"
        cy="10"
        r="5.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M14.4 14.4L19.1 19.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function Piece({ meta }: PieceComponentProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isOpen, setIsOpen] = useState(false)

  const style = useMemo(
    () =>
      ({
        '--rollin-closed-ball-size': `${ROLLIN_SEARCH_SPEC.closedBallSize}px`,
        '--rollin-open-width': `${ROLLIN_SEARCH_SPEC.openWidth}px`,
        '--rollin-open-height': `${ROLLIN_SEARCH_SPEC.openHeight}px`,
        '--rollin-track-radius': `${ROLLIN_SEARCH_SPEC.trackRadius}px`,
        '--rollin-ball-travel': `${ROLLIN_SEARCH_SPEC.ballTravel}px`,
        '--rollin-closed-ball-left': `${ROLLIN_SEARCH_SPEC.closedBallLeft}px`,
        '--rollin-ball-dock-inset': `${ROLLIN_SEARCH_SPEC.ballDockInset}px`,
        '--rollin-accent-width': `${ROLLIN_SEARCH_SPEC.accentWidth}px`,
        '--rollin-accent-height': `${ROLLIN_SEARCH_SPEC.accentHeight}px`,
        '--rollin-accent-inset-left': `${ROLLIN_SEARCH_SPEC.accentInsetLeft}px`,
        '--rollin-accent-inset-top': `${ROLLIN_SEARCH_SPEC.accentInsetTop}px`,
        '--rollin-label-inset-left': `${ROLLIN_SEARCH_SPEC.labelInsetLeft}px`,
        '--rollin-content-height': `${ROLLIN_SEARCH_SPEC.contentHeight}px`,
        '--rollin-content-inset-top': `${ROLLIN_SEARCH_SPEC.contentInsetTop}px`,
        '--rollin-content-max-width': `${ROLLIN_SEARCH_SPEC.contentMaxWidth}px`,
        '--rollin-highlight-size': `${ROLLIN_SEARCH_SPEC.highlightSize}px`,
        '--rollin-highlight-offset-x': `${ROLLIN_SEARCH_SPEC.highlightOffsetX}px`,
        '--rollin-highlight-offset-y': `${ROLLIN_SEARCH_SPEC.highlightOffsetY}px`,
        '--rollin-large-shadow-size': `${ROLLIN_SEARCH_SPEC.largeShadowSize}px`,
        '--rollin-large-shadow-offset-x': `${ROLLIN_SEARCH_SPEC.largeShadowOffsetX}px`,
        '--rollin-large-shadow-offset-y': `${ROLLIN_SEARCH_SPEC.largeShadowOffsetY}px`,
        '--rollin-small-shadow-width': `${ROLLIN_SEARCH_SPEC.smallShadowWidth}px`,
        '--rollin-small-shadow-height': `${ROLLIN_SEARCH_SPEC.smallShadowHeight}px`,
        '--rollin-small-shadow-offset-x': `${ROLLIN_SEARCH_SPEC.smallShadowOffsetX}px`,
        '--rollin-small-shadow-offset-y': `${ROLLIN_SEARCH_SPEC.smallShadowOffsetY}px`,
        '--rollin-face-size': `${ROLLIN_SEARCH_SPEC.faceSize}px`,
        '--rollin-face-cycle': `${ROLLIN_SEARCH_SPEC.faceCycle}px`,
        '--rollin-face-center-offset-x': `${ROLLIN_SEARCH_SPEC.faceCenterOffsetX}px`,
        '--rollin-face-center-offset-y': `${ROLLIN_SEARCH_SPEC.faceCenterOffsetY}px`,
        '--rollin-label-readable-at': `${ROLLIN_SEARCH_SPEC.labelReadableAt}`,
        '--rollin-indicator-blink-duration': `${ROLLIN_SEARCH_SPEC.indicatorBlinkDurationMs}ms`,
        '--rollin-indicator-fade-out-duration': `${ROLLIN_SEARCH_SPEC.indicatorFadeOutDurationMs}ms`,
        '--rollin-settle-delay-ratio': `${ROLLIN_SEARCH_SPEC.settleDelayRatio}`,
        '--rollin-open-duration': `${prefersReducedMotion ? ROLLIN_SEARCH_SPEC.reducedMotionDurationMs : ROLLIN_SEARCH_SPEC.openDurationMs}ms`,
        '--rollin-close-duration': `${prefersReducedMotion ? ROLLIN_SEARCH_SPEC.reducedMotionDurationMs : ROLLIN_SEARCH_SPEC.closeDurationMs}ms`,
        '--rollin-ease': ROLLIN_SEARCH_SPEC.ease,
      }) as CSSProperties,
    [prefersReducedMotion],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <section className="rollin-search-piece" aria-label={meta.title}>
      <div className="rollin-search-piece__center">
        <button
          type="button"
          className="rollin-search-control"
          data-state={isOpen ? 'open' : 'closed'}
          data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
          aria-label={isOpen ? 'Collapse search control' : 'Expand search control'}
          aria-pressed={isOpen}
          onClick={() => {
            setIsOpen((currentState) => !currentState)
          }}
          onKeyDown={handleKeyDown}
          style={style}
        >
          <span className="rollin-search-control__track" aria-hidden="true">
            <span className="rollin-search-control__content">
              <span className="rollin-search-control__indicator" />
              <span className="rollin-search-control__label">Search</span>
            </span>
          </span>

          <span className="rollin-search-control__shadow rollin-search-control__shadow--large" aria-hidden="true" />
          <span className="rollin-search-control__shadow rollin-search-control__shadow--small" aria-hidden="true" />

          <span className="rollin-search-control__ball" aria-hidden="true">
            <span className="rollin-search-control__face-window">
              <span className="rollin-search-control__face-strip">
                <span className="rollin-search-control__face rollin-search-control__face--search">
                  <SearchIcon />
                </span>
                <span className="rollin-search-control__face rollin-search-control__face--arrow">
                  <ArrowIcon />
                </span>
              </span>
            </span>
            <span className="rollin-search-control__highlight" />
          </span>
        </button>
      </div>
    </section>
  )
}
