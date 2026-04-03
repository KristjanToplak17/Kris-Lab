import { motion } from 'motion/react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SVGProps,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getPiecePath } from '../lib/navigation'
import { ProjectWindow } from '../host/ProjectWindow'
import { getListReveal, shellEase } from '../lib/motion'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import type { PieceMeta } from '../pieces/types'
import { AppList } from './AppList'
import { ShellNotFoundState } from './NotFoundRoute'
import './shell.css'

interface ShellLayoutProps {
  pieces: PieceMeta[]
  activeProject: PieceMeta | null
  missingProjectSlug?: string | null
}

type ShellView = 'root' | 'experiments' | 'about'
type RootViewMode = 'grid' | 'list'
type RootEntryId = 'experiments' | 'about'

interface ShellRouteState {
  fromLab?: boolean
  shellView?: ShellView
  rootViewMode?: RootViewMode
}

type ActiveSurface = 'finder' | 'project'
type LaunchSource = 'lab' | 'direct'

type FinderFolderIconProps = SVGProps<SVGSVGElement>

type DockItemKind = 'finder' | 'future-slot'
type DockItemAction = 'root' | 'noop'
type AboutDocumentLineKind = 'title' | 'heading' | 'body' | 'list' | 'blank'

interface AboutDocumentSourceLine {
  kind: AboutDocumentLineKind
  content: string
  marker?: string
}

interface DockItem {
  id: string
  label: string
  kind: DockItemKind
  action: DockItemAction
  isRunning?: boolean
}

interface DockIconButtonProps {
  label: string
  kind: DockItemKind
  isActive?: boolean
  disabled?: boolean
  reducedMotion: boolean
  showTooltip?: boolean
  onActivate?: () => void
  onTooltipBlur?: (event: ReactFocusEvent<HTMLButtonElement>) => void
  onTooltipFocus?: () => void
  onTooltipPointerEnter?: () => void
  onTooltipPointerLeave?: (event: ReactPointerEvent<HTMLButtonElement>) => void
  children?: ReactNode
}

interface RootEntry {
  id: RootEntryId
  label: string
  caption: string
  meta: string
}

const dockItems: DockItem[] = [
  { id: 'finder', label: 'Finder', kind: 'finder', action: 'root', isRunning: true },
  { id: 'future-slot-1', label: 'Future app slot', kind: 'future-slot', action: 'noop' },
  { id: 'future-slot-2', label: 'Future app slot', kind: 'future-slot', action: 'noop' },
  { id: 'future-slot-3', label: 'Future app slot', kind: 'future-slot', action: 'noop' },
]

const aboutDocumentSource: AboutDocumentSourceLine[] = [
  { kind: 'title', marker: '#', content: "Kris' Lab" },
  { kind: 'blank', content: '' },
  {
    kind: 'body',
    content:
      "Kris' Lab is a quiet launcher for a small set of interactive design experiments.",
  },
  {
    kind: 'body',
    content:
      'The shell is intentionally restrained: it should orient the work, hold the window together, and then step back.',
  },
  { kind: 'blank', content: '' },
  { kind: 'heading', marker: '##', content: 'What the shell is for' },
  { kind: 'blank', content: '' },
  {
    kind: 'list',
    marker: '-',
    content:
      'Keep one persistent window instead of turning the project into a page-by-page site.',
  },
  {
    kind: 'list',
    marker: '-',
    content:
      'Let approved pieces stay easy to browse while more experimental work can live off the main path.',
  },
  {
    kind: 'list',
    marker: '-',
    content: 'Use macOS as a structural cue, not as costume or parody.',
  },
  { kind: 'blank', content: '' },
  { kind: 'heading', marker: '##', content: 'Reading note' },
  { kind: 'blank', content: '' },
  {
    kind: 'body',
    content:
      'This About file is meant to read like a project document opened inside the lab.',
  },
  {
    kind: 'body',
    content:
      'It should feel calm, legible, and slightly file-like, without becoming a code editor or a dashboard surface.',
  },
  { kind: 'blank', content: '' },
  { kind: 'heading', marker: '##', content: 'Current direction' },
  { kind: 'blank', content: '' },
  {
    kind: 'body',
    content:
      'Refine the shell carefully, preserve the autonomy of each piece, and only add visual weight when it meaningfully improves clarity or polish.',
  },
  {
    kind: 'body',
    content:
      'Each experiment can become more expressive than the launcher that contains it.',
  },
]

const aboutDocumentLines = aboutDocumentSource.map((line, index) => ({
  ...line,
  number: String(index + 1),
}))

function FinderFolderIcon(props: FinderFolderIconProps) {
  const topGradientId = useId()
  const bodyGradientId = useId()
  const edgeGradientId = useId()
  const shadowId = useId()
  const topStart = 'var(--shell-folder-current-top, var(--shell-folder-top))'
  const topEnd = 'var(--shell-folder-current-top-2, var(--shell-folder-top-2))'
  const bodyStart = 'var(--shell-folder-current-body, var(--shell-folder-body))'
  const bodyEnd = 'var(--shell-folder-current-body-2, var(--shell-folder-body-2))'
  const edgeStart = 'var(--shell-folder-current-edge, var(--shell-folder-edge))'
  const edgeEnd = 'var(--shell-folder-current-edge-2, var(--shell-folder-edge-2))'
  const stroke = 'var(--shell-folder-current-stroke, var(--shell-folder-stroke))'
  const sheen = 'var(--shell-folder-current-sheen, var(--shell-folder-sheen))'
  const highlight = 'var(--shell-folder-current-highlight, var(--shell-folder-highlight))'
  const shadow = 'var(--shell-folder-current-shadow, var(--shell-folder-shadow))'

  return (
    <svg viewBox="0 0 120 92" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={topGradientId} x1="60" y1="8" x2="60" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={topStart} />
          <stop offset="1" stopColor={topEnd} />
        </linearGradient>
        <linearGradient id={bodyGradientId} x1="60" y1="24" x2="60" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={bodyStart} />
          <stop offset="1" stopColor={bodyEnd} />
        </linearGradient>
        <linearGradient id={edgeGradientId} x1="60" y1="23" x2="60" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={edgeStart} />
          <stop offset="1" stopColor={edgeEnd} />
        </linearGradient>
        <filter id={shadowId} x="0" y="4" width="120" height="88" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor={shadow} floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter={`url(#${shadowId})`}>
        <path
          d="M14 28.5C14 20.492 20.492 14 28.5 14H45.2C48.508 14 51.72 12.894 54.325 10.856L56.938 8.812C59.542 6.775 62.754 5.667 66.063 5.667H80.7C88.708 5.667 95.2 12.159 95.2 20.167V29.5H14Z"
          fill={`url(#${topGradientId})`}
          stroke={stroke}
          strokeWidth="1.1"
        />
        <path
          d="M8.5 29C8.5 23.201 13.201 18.5 19 18.5H48.657C51.362 18.5 53.956 17.452 55.898 15.576L57.945 13.6C59.887 11.724 62.481 10.676 65.186 10.676H98.5C104.299 10.676 109 15.377 109 21.176V67.5C109 73.299 104.299 78 98.5 78H19C13.201 78 8.5 73.299 8.5 67.5V29Z"
          fill={`url(#${bodyGradientId})`}
          stroke={`url(#${edgeGradientId})`}
          strokeWidth="1.2"
        />
        <path
          d="M14.5 33.5H103"
          stroke={sheen}
          strokeOpacity="0.52"
          strokeWidth="1.15"
        />
        <path
          d="M20.5 27.5H95.5"
          stroke={highlight}
          strokeOpacity="0.65"
          strokeWidth="0.9"
        />
      </g>
    </svg>
  )
}

function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9.75 3.25L5.25 8L9.75 12.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6.25L8 10.25L12 6.25"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconGridViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <rect x="2.2" y="2.2" width="5.05" height="5.05" rx="1.35" fill="currentColor" />
      <rect x="10.75" y="2.2" width="5.05" height="5.05" rx="1.35" fill="currentColor" />
      <rect x="2.2" y="10.75" width="5.05" height="5.05" rx="1.35" fill="currentColor" />
      <rect x="10.75" y="10.75" width="5.05" height="5.05" rx="1.35" fill="currentColor" />
    </svg>
  )
}

function ListViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <circle cx="3.6" cy="4.2" r="1.1" fill="currentColor" />
      <circle cx="3.6" cy="9" r="1.1" fill="currentColor" />
      <circle cx="3.6" cy="13.8" r="1.1" fill="currentColor" />
      <path d="M7 4.2H14.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 9H14.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7 13.8H14.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function FinderGlyphIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="finderLeft" x1="7" y1="8" x2="30" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9cd2ff" />
          <stop offset="1" stopColor="#4da0ff" />
        </linearGradient>
        <linearGradient id="finderRight" x1="34" y1="8" x2="58" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3fbff" />
          <stop offset="1" stopColor="#b9e6ff" />
        </linearGradient>
      </defs>
      <rect x="7" y="8" width="50" height="48" rx="13" fill="#0f1522" opacity="0.12" />
      <path d="M7 18.5C7 12.701 11.701 8 17.5 8H32V56H17.5C11.701 56 7 51.299 7 45.5V18.5Z" fill="url(#finderLeft)" />
      <path d="M32 8H46.5C52.299 8 57 12.701 57 18.5V45.5C57 51.299 52.299 56 46.5 56H32V8Z" fill="url(#finderRight)" />
      <path d="M32 13V51" stroke="#12386a" strokeWidth="1.6" opacity="0.32" />
      <path d="M16.8 27.2C18.146 24.825 20.27 23.5 23.1 23.5C25.93 23.5 28.054 24.825 29.4 27.2" stroke="#153960" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M34.6 27.2C35.946 24.825 38.07 23.5 40.9 23.5C43.73 23.5 45.854 24.825 47.2 27.2" stroke="#153960" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="24.1" cy="31.6" r="2.1" fill="#153960" />
      <circle cx="39.9" cy="31.6" r="2.1" fill="#153960" />
      <path d="M21.2 42C24.092 45.217 27.558 46.8 32 46.8C36.442 46.8 39.908 45.217 42.8 42" stroke="#153960" strokeWidth="2.35" strokeLinecap="round" />
      <path d="M31.8 34.5C31.8 38.94 29.32 42.255 24.35 44.65" stroke="#153960" strokeWidth="2.05" strokeLinecap="round" />
      <path d="M22.2 15.2H41.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

function DockIconButton({
  label,
  kind,
  isActive = false,
  disabled = false,
  reducedMotion,
  showTooltip = false,
  onActivate,
  onTooltipBlur,
  onTooltipFocus,
  onTooltipPointerEnter,
  onTooltipPointerLeave,
  children,
}: DockIconButtonProps) {
  const [isPressing, setIsPressing] = useState(false)
  const iconFrameRef = useRef<HTMLSpanElement>(null)

  const resetPressState = () => {
    setIsPressing(false)
  }

  const restartBounce = () => {
    const iconFrame = iconFrameRef.current

    if (!iconFrame) {
      return
    }

    iconFrame.classList.remove('is-bouncing')
    void iconFrame.offsetWidth
    iconFrame.classList.add('is-bouncing')
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || event.button !== 0) {
      return
    }

    setIsPressing(true)
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled || (event.key !== 'Enter' && event.key !== ' ')) {
      return
    }

    setIsPressing(true)
  }

  const handleClick = () => {
    if (!disabled && !reducedMotion) {
      restartBounce()
    }

    setIsPressing(false)
    onActivate?.()
  }

  return (
    <button
      type="button"
      className={[
        'shell-dock__button',
        isActive ? 'is-active' : '',
        kind === 'future-slot' ? 'shell-dock__button--future' : '',
        isPressing ? 'is-pressing' : '',
      ].filter(Boolean).join(' ')}
      aria-label={label}
      aria-pressed={isActive || undefined}
      disabled={disabled}
      data-slot-kind={kind}
      onPointerEnter={onTooltipPointerEnter}
      onPointerDown={handlePointerDown}
      onPointerUp={resetPressState}
      onPointerLeave={(event) => {
        resetPressState()
        onTooltipPointerLeave?.(event)
      }}
      onPointerCancel={resetPressState}
      onKeyDown={handleKeyDown}
      onKeyUp={resetPressState}
      onFocus={onTooltipFocus}
      onBlur={(event) => {
        resetPressState()
        onTooltipBlur?.(event)
      }}
      onClick={handleClick}
    >
      <span className="shell-dock__motion-shell" aria-hidden="true">
        <span
          ref={iconFrameRef}
          className="shell-dock__icon-frame"
          onAnimationEnd={(event) => {
            if (event.animationName === 'shell-dock-bounce') {
              event.currentTarget.classList.remove('is-bouncing')
            }
          }}
        >
          {children}
        </span>
      </span>
      {isActive ? <span className="shell-dock__indicator" aria-hidden="true" /> : null}
      {showTooltip ? (
        <span className="shell-dock__tooltip" aria-hidden="true">
          {label}
        </span>
      ) : null}
    </button>
  )
}

function SidebarFolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.25 5.1C2.25 4.106 3.056 3.3 4.05 3.3H6.052C6.462 3.3 6.858 3.164 7.18 2.914L7.492 2.67C7.814 2.42 8.21 2.284 8.62 2.284H10.664C11.658 2.284 12.464 3.09 12.464 4.084V5.15H2.25V5.1Z"
        fill="currentColor"
        opacity="0.86"
      />
      <path
        d="M1.9 5.3C1.9 4.582 2.482 4 3.2 4H6.476C6.78 4 7.074 3.89 7.304 3.69L7.54 3.486C7.77 3.287 8.064 3.176 8.368 3.176H12.8C13.518 3.176 14.1 3.758 14.1 4.476V10.9C14.1 11.618 13.518 12.2 12.8 12.2H3.2C2.482 12.2 1.9 11.618 1.9 10.9V5.3Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SidebarDocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.05 1.95H9.28L12.1 4.78V12.05C12.1 12.685 11.585 13.2 10.95 13.2H4.05C3.415 13.2 2.9 12.685 2.9 12.05V3.1C2.9 2.465 3.415 1.95 4.05 1.95Z"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path d="M9.05 2.05V4.95H11.95" stroke="currentColor" strokeWidth="1.15" />
      <path d="M5.2 7.15H9.8" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
      <path d="M5.2 9.25H9.3" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
    </svg>
  )
}

export function ShellLayout({
  pieces,
  activeProject,
  missingProjectSlug = null,
}: ShellLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const reducedMotion = usePrefersReducedMotion()
  const state = (location.state as ShellRouteState | null | undefined) ?? null
  const [view, setView] = useState<ShellView>(
    () => state?.shellView ?? (missingProjectSlug ? 'experiments' : 'root'),
  )
  const [rootViewMode, setRootViewMode] = useState<RootViewMode>(
    () => state?.rootViewMode ?? 'grid',
  )
  const [hoveredDockItemId, setHoveredDockItemId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const dockTooltipTimerRef = useRef<number | null>(null)
  const dockTooltipPrimedRef = useRef(false)
  const hasMissingProject = missingProjectSlug !== null
  const hasProjectWindow = activeProject !== null
  const activeSurface: ActiveSurface = hasProjectWindow ? 'project' : 'finder'
  const projectLaunchSource: LaunchSource | null = hasProjectWindow
    ? state?.fromLab
      ? 'lab'
      : 'direct'
    : null
  const sidebarView: ShellView = hasMissingProject ? 'experiments' : view

  useEffect(() => {
    document.body.dataset.pieceMode = 'shell'

    return () => {
      delete document.body.dataset.pieceMode
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (dockTooltipTimerRef.current !== null) {
        window.clearTimeout(dockTooltipTimerRef.current)
      }
    }
  }, [])

  const buildShellRouteState = (
    nextView: ShellView,
    nextRootViewMode = rootViewMode,
  ): ShellRouteState => {
    if (state?.fromLab) {
      return { fromLab: true, shellView: nextView, rootViewMode: nextRootViewMode }
    }

    return { shellView: nextView, rootViewMode: nextRootViewMode }
  }

  const syncShellState = (nextView: ShellView, nextRootViewMode = rootViewMode) => {
    navigate(hasMissingProject ? '/' : '.', {
      replace: true,
      state: buildShellRouteState(nextView, nextRootViewMode),
    })
  }

  const updateView = (nextView: ShellView) => {
    setView(nextView)
    syncShellState(nextView)
  }

  const updateRootViewMode = (nextMode: RootViewMode) => {
    setRootViewMode(nextMode)
    syncShellState(view, nextMode)
  }

  const currentTitle = hasMissingProject
    ? 'Experiment unavailable'
    : view === 'root'
      ? "Kris' Lab"
      : view === 'experiments'
        ? 'Experiments'
        : 'About.md'

  const currentPathLabel = hasMissingProject
    ? 'Experiment unavailable'
    : view === 'root'
      ? "Kris' Lab"
      : view === 'experiments'
        ? 'Experiments'
        : 'About.md'

  const windowReveal = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.12 },
      }
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.18, ease: shellEase },
      }

  const openRootEntry = (entryId: RootEntryId) => {
    updateView(entryId)
  }

  const clearDockTooltipTimer = () => {
    if (dockTooltipTimerRef.current !== null) {
      window.clearTimeout(dockTooltipTimerRef.current)
      dockTooltipTimerRef.current = null
    }
  }

  const showDockTooltip = (itemId: string, delayed: boolean) => {
    clearDockTooltipTimer()

    if (reducedMotion || dockTooltipPrimedRef.current || !delayed) {
      setHoveredDockItemId(itemId)
      dockTooltipPrimedRef.current = true
      return
    }

    dockTooltipTimerRef.current = window.setTimeout(() => {
      setHoveredDockItemId(itemId)
      dockTooltipPrimedRef.current = true
      dockTooltipTimerRef.current = null
    }, 96)
  }

  const hideDockTooltip = (resetPrimed = false) => {
    clearDockTooltipTimer()
    setHoveredDockItemId(null)

    if (resetPrimed) {
      dockTooltipPrimedRef.current = false
    }
  }

  const openPiece = (piece: PieceMeta) => {
    navigate(getPiecePath(piece.slug), {
      state: { fromLab: true, shellView: view, rootViewMode },
    })
  }

  const closeProject = () => {
    if (!hasProjectWindow) {
      return
    }

    if (projectLaunchSource === 'lab') {
      navigate(-1)
      return
    }

    navigate('/', {
      replace: true,
      state: { shellView: view, rootViewMode },
    })
  }

  const currentDateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(currentTime)

  const rootEntries: RootEntry[] = [
    {
      id: 'experiments',
      label: 'Experiments',
      caption: 'Approved studies',
      meta: `${pieces.length} ${pieces.length === 1 ? 'live piece' : 'live pieces'}`,
    },
    {
      id: 'about',
      label: 'About',
      caption: 'Project notes',
      meta: 'Reference file',
    },
  ]

  return (
    <motion.main
      className="shell-route"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty('--shell-cursor-x', `${event.clientX - rect.left}px`)
        event.currentTarget.style.setProperty('--shell-cursor-y', `${event.clientY - rect.top}px`)
        event.currentTarget.style.setProperty('--shell-cursor-opacity', '1')
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty('--shell-cursor-opacity', '0')
      }}
      {...windowReveal}
    >
      <header className="shell-system-bar" aria-label="System status bar">
        <div className="shell-system-bar__inner">
          <div className="shell-system-bar__left">
            <span className="shell-system-bar__brand">Kris&apos; Lab</span>
          </div>

          <div className="shell-system-bar__right">
            <span className="shell-system-bar__time" aria-label={`Local date and time ${currentDateLabel}`}>
              {currentDateLabel}
            </span>
          </div>
        </div>
      </header>

      <div className="shell-route__viewport">
        <div
          className={`shell-route__canvas shell-route__canvas--${activeSurface}`}
          data-active-surface={activeSurface}
        >
          <div
            className="shell-route__finder-layer"
            aria-hidden={hasProjectWindow || undefined}
            inert={hasProjectWindow}
          >
            <div className="shell-window" role="application" aria-label="Kris' Lab launcher">
              <header className="shell-window__titlebar">
                <div className="shell-window__traffic" aria-hidden="true">
                  <span className="shell-window__traffic-light shell-window__traffic-light--close" />
                  <span className="shell-window__traffic-light shell-window__traffic-light--minimize" />
                  <span className="shell-window__traffic-light shell-window__traffic-light--maximize" />
                </div>

                <div className="shell-window__title">{currentTitle}</div>

                <div className="shell-window__title-spacer" aria-hidden="true" />
              </header>

              <div className="shell-window__toolbar">
                <button
                  type="button"
                  className="shell-toolbar__back"
                  onClick={() => updateView('root')}
                  disabled={!hasMissingProject && view === 'root'}
                  aria-label="Go back"
                >
                  <ChevronLeftIcon className="shell-toolbar__back-icon" />
                </button>

                <div className="shell-toolbar__path" aria-label="Current location">
                  <span className="shell-toolbar__path-root">Kris&apos; Lab</span>
                  {view !== 'root' ? (
                    <>
                      <span className="shell-toolbar__separator">/</span>
                      <span className="shell-toolbar__path-current">{currentPathLabel}</span>
                    </>
                  ) : null}
                </div>

                <div className="shell-toolbar__trailing">
                  {!hasMissingProject && view === 'root' ? (
                    <div className="shell-toolbar__view-controls">
                      <div className="shell-view-toggle" role="group" aria-label="Root view mode">
                        <button
                          type="button"
                          className={`shell-view-toggle__button${rootViewMode === 'grid' ? ' is-active' : ''}`}
                          onClick={() => updateRootViewMode('grid')}
                          aria-label="Icon view"
                          aria-pressed={rootViewMode === 'grid'}
                        >
                          <IconGridViewIcon className="shell-view-toggle__icon" />
                        </button>
                        <button
                          type="button"
                          className={`shell-view-toggle__button${rootViewMode === 'list' ? ' is-active' : ''}`}
                          onClick={() => updateRootViewMode('list')}
                          aria-label="List view"
                          aria-pressed={rootViewMode === 'list'}
                        >
                          <ListViewIcon className="shell-view-toggle__icon" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="shell-window__content">
                <aside className="shell-sidebar" aria-label="Sidebar">
                  <nav className="shell-sidebar__nav">
                    <div className="shell-sidebar__tree">
                      <button
                        type="button"
                        className={`shell-sidebar__item shell-sidebar__item--parent${sidebarView === 'root' ? ' is-active' : ''}`}
                        onClick={() => updateView('root')}
                      >
                        <span className="shell-sidebar__tree-cue" aria-hidden="true">
                          <ChevronDownIcon className="shell-sidebar__tree-icon" />
                        </span>
                        <span className="shell-sidebar__item-main">
                          <span className="shell-sidebar__item-label">Kris&apos; Lab</span>
                        </span>
                      </button>

                      <div className="shell-sidebar__children" aria-label="Kris' Lab children">
                        <button
                          type="button"
                          className={`shell-sidebar__item shell-sidebar__item--child${sidebarView === 'experiments' ? ' is-active' : ''}`}
                          onClick={() => updateView('experiments')}
                        >
                          <span className="shell-sidebar__item-main">
                            <SidebarFolderIcon className="shell-sidebar__item-icon" />
                            <span className="shell-sidebar__item-label">Experiments</span>
                          </span>
                          <span className="shell-sidebar__item-count">{pieces.length.toString()}</span>
                        </button>

                        <button
                          type="button"
                          className={`shell-sidebar__item shell-sidebar__item--child${sidebarView === 'about' ? ' is-active' : ''}`}
                          onClick={() => updateView('about')}
                        >
                          <span className="shell-sidebar__item-main">
                            <SidebarDocumentIcon className="shell-sidebar__item-icon" />
                            <span className="shell-sidebar__item-label">About</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </nav>
                </aside>

                <div className="shell-main">
                  {hasMissingProject ? (
                    <section className="shell-view shell-view--missing">
                      <ShellNotFoundState
                        missingProjectSlug={missingProjectSlug}
                        onReturn={() => updateView('experiments')}
                      />
                    </section>
                  ) : null}

                  {!hasMissingProject && view === 'root' ? (
                    <section className="shell-view shell-view--icons">
                      {rootViewMode === 'grid' ? (
                        <div className="shell-icon-grid" role="list" aria-label="Root folders">
                          {rootEntries.map((entry, index) => (
                            <motion.button
                              key={entry.id}
                              type="button"
                              className="shell-icon-item"
                              role="listitem"
                              {...getListReveal(reducedMotion, index)}
                              onClick={() => openRootEntry(entry.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault()
                                  openRootEntry(entry.id)
                                }
                              }}
                            >
                              <FinderFolderIcon className="shell-icon-item__folder" />
                              <span className="shell-icon-item__copy">
                                <span className="shell-icon-item__label">{entry.label}</span>
                                <span className="shell-icon-item__caption">{entry.caption}</span>
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="shell-root-list-view">
                          <ul className="shell-list shell-list--root" role="list">
                            {rootEntries.map((entry, index) => (
                              <motion.li
                                key={entry.id}
                                className="shell-list__item"
                                {...getListReveal(reducedMotion, index)}
                              >
                                <button
                                  type="button"
                                  className="shell-list__link shell-list__link--button"
                                  onClick={() => openRootEntry(entry.id)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault()
                                      openRootEntry(entry.id)
                                    }
                                  }}
                                >
                                  <span className="shell-list__name shell-list__name--stacked">
                                    <span className="shell-list__icon" aria-hidden="true" />
                                    <span className="shell-list__copy">
                                      <span className="shell-list__title">{entry.label}</span>
                                      <span className="shell-list__description">{entry.caption}</span>
                                    </span>
                                  </span>
                                  <span className="shell-list__meta shell-list__meta--quiet">
                                    {entry.meta}
                                  </span>
                                </button>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  ) : null}

                  {!hasMissingProject && view === 'experiments' ? (
                    <section className="shell-view shell-view--list">
                      <AppList pieces={pieces} onOpenPiece={openPiece} />
                    </section>
                  ) : null}

                  {!hasMissingProject && view === 'about' ? (
                    <section className="shell-view shell-view--about">
                      <div className="shell-document" aria-label="About document">
                        <div className="shell-document__body" role="document" aria-label="About.md">
                          <div className="shell-document__lines">
                            {aboutDocumentLines.map((line) => (
                              <div
                                key={line.number}
                                className={`shell-document__line shell-document__line--${line.kind}`}
                              >
                                <span className="shell-document__gutter" aria-hidden="true">
                                  {line.number}
                                </span>
                                <div className="shell-document__content">
                                  {line.marker ? (
                                    <span className="shell-document__marker" aria-hidden="true">
                                      {line.marker}
                                    </span>
                                  ) : null}
                                  <span className="shell-document__text">{line.content}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {activeProject ? (
            <div className="shell-route__project-layer">
              <ProjectWindow piece={activeProject} onClose={closeProject} />
            </div>
          ) : null}
        </div>
      </div>

      <nav className="shell-dock" aria-label="Dock">
        <div className="shell-dock__inner" onPointerLeave={() => hideDockTooltip(true)}>
          {dockItems.map((item) => {
            const isFinderSlot = item.kind === 'finder'
            const isDisabled = item.action === 'root' ? hasProjectWindow : false
            const handleActivate = () => {
              if (item.action === 'root') {
                updateView('root')
              }
            }

            return (
              <DockIconButton
                key={item.id}
                label={item.label}
                kind={item.kind}
                isActive={item.isRunning}
                disabled={isDisabled}
                reducedMotion={reducedMotion}
                onActivate={handleActivate}
                showTooltip={hoveredDockItemId === item.id}
                onTooltipPointerEnter={() => showDockTooltip(item.id, true)}
                onTooltipPointerLeave={(event) => {
                  const next = event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null

                  if (next?.closest('.shell-dock__button')) {
                    return
                  }

                  hideDockTooltip()
                }}
                onTooltipFocus={() => showDockTooltip(item.id, false)}
                onTooltipBlur={(event) => {
                  const next = event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null

                  if (next?.closest('.shell-dock__button')) {
                    return
                  }

                  hideDockTooltip(true)
                }}
              >
                {isFinderSlot ? (
                  <FinderGlyphIcon className="shell-dock__finder" />
                ) : null}
              </DockIconButton>
            )
          })}
        </div>
      </nav>
    </motion.main>
  )
}
