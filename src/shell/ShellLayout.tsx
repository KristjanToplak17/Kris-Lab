import { motion } from 'motion/react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SVGProps,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProjectPath } from '../lib/navigation'
import { ProjectWindow } from '../host/ProjectWindow'
import { getListReveal, shellEase } from '../lib/motion'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import {
  clampRectToBounds,
  moveIdToEnd,
  rectEquals,
  type DesktopBounds,
  type WindowRect,
} from '../lib/windowing'
import type { PublicProjectEntry } from '../pieces/types'
import { AppList } from './AppList'
import { ShellNotFoundState } from './NotFoundRoute'
import {
  aboutAppId,
  aboutWindowId,
  createProjectAppId,
  createProjectWindowId,
  launcherAppId,
  launcherWindowId,
  type AboutAppRecord,
  type LauncherAppRecord,
  type LauncherView,
  type ProjectAppRecord,
  type ShellWindowRecord,
} from './runtime'
import './shell.css'

interface ShellLayoutProps {
  pieces: PublicProjectEntry[]
  activeProject: PublicProjectEntry | null
  missingProjectSlug?: string | null
}

type ShellView = LauncherView
type RootViewMode = 'grid' | 'list'
type RootEntryId = 'projects' | 'about'

interface ShellRouteState {
  fromLab?: boolean
  shellView?: ShellView
  rootViewMode?: RootViewMode
}

type LauncherFolderIconProps = SVGProps<SVGSVGElement>

type DockItemKind = 'launcher'
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

interface DesktopMetrics extends DesktopBounds {
  top: number
  bottom: number
}

interface DragSession {
  bounds: DesktopBounds
  hasCrossedThreshold: boolean
  pointerId: number
  startPointer: {
    x: number
    y: number
  }
  startRect: WindowRect
  windowId: string
}

const dockItems: DockItem[] = [
  { id: launcherAppId, label: 'Launcher', kind: 'launcher' },
]

const desktopDragThreshold = 2
const desktopWindowEdgeInset = 3
const desktopFinePointerQuery = '(hover: hover) and (pointer: fine)'
const aboutWindowSessionKey = 'kris-lab.about-window-opened'

const launcherWindowDefaults = {
  height: 560,
  minHeight: 420,
  minWidth: 720,
  width: 1104,
}

const aboutWindowDefaults = {
  height: 548,
  minHeight: 380,
  minWidth: 620,
  width: 824,
}

const projectWindowDefaults = {
  height: 596,
  minHeight: 460,
  minWidth: 780,
  width: 1148,
}

function orderEquals(current: string[], next: string[]) {
  if (current.length !== next.length) {
    return false
  }

  return current.every((value, index) => value === next[index])
}

function getInitialAboutWindowOpen(hasProjectWindow: boolean) {
  if (hasProjectWindow || typeof window === 'undefined') {
    return false
  }

  try {
    if (window.sessionStorage.getItem(aboutWindowSessionKey) === 'shown') {
      return false
    }

    // Mark the About window as shown at the same moment we decide to auto-open it,
    // so reloads within the same browser session cannot re-trigger the first-load behavior.
    window.sessionStorage.setItem(aboutWindowSessionKey, 'shown')
    return true
  } catch {
    return true
  }
}

const aboutDocumentSource: AboutDocumentSourceLine[] = [
  { kind: 'title', marker: '#', content: "Kris' Lab" },
  { kind: 'blank', content: '' },
  {
    kind: 'body',
    content:
      "Kris' Lab is a quiet launcher for a small set of interactive projects.",
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
      'Let public projects stay easy to browse while more experimental work can live off the main path.',
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
      'Refine the shell carefully, preserve the autonomy of each project, and only add visual weight when it meaningfully improves clarity or polish.',
  },
  {
    kind: 'body',
    content:
      'Each project can become more expressive than the launcher that contains it.',
  },
]

const aboutDocumentLines = aboutDocumentSource.map((line, index) => ({
  ...line,
  number: String(index + 1),
}))

function LauncherFolderIcon(props: LauncherFolderIconProps) {
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

function LauncherGlyphIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="launcherLeft" x1="7" y1="8" x2="30" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9cd2ff" />
          <stop offset="1" stopColor="#4da0ff" />
        </linearGradient>
        <linearGradient id="launcherRight" x1="34" y1="8" x2="58" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f3fbff" />
          <stop offset="1" stopColor="#b9e6ff" />
        </linearGradient>
      </defs>
      <rect x="7" y="8" width="50" height="48" rx="13" fill="#0f1522" opacity="0.12" />
      <path d="M7 18.5C7 12.701 11.701 8 17.5 8H32V56H17.5C11.701 56 7 51.299 7 45.5V18.5Z" fill="url(#launcherLeft)" />
      <path d="M32 8H46.5C52.299 8 57 12.701 57 18.5V45.5C57 51.299 52.299 56 46.5 56H32V8Z" fill="url(#launcherRight)" />
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
        d="M2.4 5.08C2.4 4.064 3.224 3.24 4.24 3.24H6.072C6.462 3.24 6.84 3.112 7.15 2.877L7.51 2.602C7.82 2.368 8.198 2.24 8.588 2.24H10.396C11.412 2.24 12.236 3.064 12.236 4.08V5.12H2.4V5.08Z"
        fill="currentColor"
        opacity="0.34"
      />
      <path
        d="M1.85 5.34C1.85 4.511 2.521 3.84 3.35 3.84H6.3C6.6 3.84 6.89 3.734 7.118 3.541L7.422 3.281C7.65 3.088 7.94 2.982 8.24 2.982H12.65C13.479 2.982 14.15 3.653 14.15 4.482V10.75C14.15 11.579 13.479 12.25 12.65 12.25H3.35C2.521 12.25 1.85 11.579 1.85 10.75V5.34Z"
        fill="currentColor"
        opacity="0.94"
      />
      <path
        d="M2.85 5.95H13.15"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SidebarDocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.15 2.1H8.92L11.55 4.72V11.92C11.55 12.688 10.928 13.31 10.16 13.31H4.15C3.382 13.31 2.76 12.688 2.76 11.92V3.49C2.76 2.722 3.382 2.1 4.15 2.1Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M4.15 2.1H8.92L11.55 4.72V11.92C11.55 12.688 10.928 13.31 10.16 13.31H4.15C3.382 13.31 2.76 12.688 2.76 11.92V3.49C2.76 2.722 3.382 2.1 4.15 2.1Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M8.92 2.1V4.12C8.92 4.451 9.189 4.72 9.52 4.72H11.55"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeOpacity="0.64"
      />
      <path d="M5.15 7.25H9.55" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.72" />
      <path d="M5.15 9.25H8.95" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.58" />
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
  const hasMissingProject = missingProjectSlug !== null
  const hasProjectWindow = activeProject !== null
  const initialAboutWindowOpen = getInitialAboutWindowOpen(hasProjectWindow)
  const initialProjectWindowId = activeProject
    ? createProjectWindowId(activeProject.slug)
    : null
  const [view, setView] = useState<ShellView>(
    () => (state?.shellView === 'projects' ? 'projects' : missingProjectSlug ? 'projects' : 'root'),
  )
  const [rootViewMode, setRootViewMode] = useState<RootViewMode>(
    () => state?.rootViewMode ?? 'grid',
  )
  const [desktopMetrics, setDesktopMetrics] = useState<DesktopMetrics | null>(null)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [draggingWindowId, setDraggingWindowId] = useState<string | null>(null)
  const [isLauncherOpen, setIsLauncherOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(initialAboutWindowOpen)
  const [activeWindowId, setActiveWindowId] = useState<string | null>(() => {
    if (initialProjectWindowId) {
      return initialProjectWindowId
    }

    if (initialAboutWindowOpen) {
      return aboutWindowId
    }

    return null
  })
  const [hoveredDockItemId, setHoveredDockItemId] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [windowOrder, setWindowOrder] = useState<string[]>(() => {
    if (initialProjectWindowId) {
      return [initialProjectWindowId]
    }

    return initialAboutWindowOpen ? [aboutWindowId] : []
  })
  const [windowRects, setWindowRects] = useState<Record<string, WindowRect>>({})
  const shellRef = useRef<HTMLElement>(null)
  const systemBarRef = useRef<HTMLElement>(null)
  const dockRef = useRef<HTMLElement>(null)
  const dockTooltipTimerRef = useRef<number | null>(null)
  const dockTooltipPrimedRef = useRef(false)
  const dragSessionRef = useRef<DragSession | null>(null)
  const previousProjectWindowIdRef = useRef<string | null>(null)
  const launcherLastKnownRectRef = useRef<WindowRect | null>(null)
  const aboutLastKnownRectRef = useRef<WindowRect | null>(null)
  const projectLastKnownRectsRef = useRef<Record<string, WindowRect>>({})
  const launcherApp = useMemo<LauncherAppRecord>(
    () => ({
      id: launcherAppId,
      kind: 'launcher',
      label: 'Launcher',
      windowId: launcherWindowId,
    }),
    [],
  )
  const aboutApp = useMemo<AboutAppRecord>(
    () => ({
      id: aboutAppId,
      kind: 'about',
      label: 'About',
      windowId: aboutWindowId,
    }),
    [],
  )
  const projectApp = useMemo<ProjectAppRecord | null>(
    () =>
      activeProject
        ? {
            id: createProjectAppId(activeProject.slug),
            kind: 'project',
            label: activeProject.title,
            windowId: createProjectWindowId(activeProject.slug),
            projectSlug: activeProject.slug,
          }
        : null,
    [activeProject],
  )
  const projectWindowId = projectApp?.windowId ?? null
  const sidebarView: ShellView = hasMissingProject ? 'projects' : view
  const desktopBounds = useMemo(
    () =>
      desktopMetrics
        ? {
            width: desktopMetrics.width,
            height: desktopMetrics.height,
          }
        : null,
    [desktopMetrics],
  )

  const getLauncherDefaultRect = (bounds: DesktopBounds): WindowRect => {
    const width = Math.min(launcherWindowDefaults.width, Math.max(bounds.width - 24, 360))
    const height = Math.min(launcherWindowDefaults.height, Math.max(bounds.height - 24, 320))

    return clampRectToBounds(
      {
        x: Math.round((bounds.width - width) / 2),
        y: Math.round(Math.max((bounds.height - height) / 2, 16)),
        width,
        height,
      },
      bounds,
      desktopWindowEdgeInset,
    )
  }

  const getAboutDefaultRect = (
    bounds: DesktopBounds,
    anchorRect: WindowRect | null = null,
  ): WindowRect => {
    const width = Math.min(aboutWindowDefaults.width, Math.max(bounds.width - 24, 360))
    const height = Math.min(aboutWindowDefaults.height, Math.max(bounds.height - 24, 320))
    const centeredRect = clampRectToBounds(
      {
        x: Math.round((bounds.width - width) / 2),
        y: Math.round(Math.max((bounds.height - height) / 2, 18)),
        width,
        height,
      },
      bounds,
      desktopWindowEdgeInset,
    )

    if (!anchorRect) {
      return centeredRect
    }

    return clampRectToBounds(
      {
        x: anchorRect.x + 72,
        y: anchorRect.y + 44,
        width,
        height,
      },
      bounds,
      desktopWindowEdgeInset,
    )
  }

  const getProjectDefaultRect = (
    bounds: DesktopBounds,
    anchorRect: WindowRect | null = null,
  ): WindowRect => {
    const width = Math.min(projectWindowDefaults.width, Math.max(bounds.width - 24, 360))
    const height = Math.min(projectWindowDefaults.height, Math.max(bounds.height - 24, 320))
    const centeredRect = clampRectToBounds(
      {
        x: Math.round((bounds.width - width) / 2),
        y: Math.round(Math.max((bounds.height - height) / 2, 16)),
        width,
        height,
      },
      bounds,
      desktopWindowEdgeInset,
    )

    if (!anchorRect) {
      return centeredRect
    }

    return clampRectToBounds(
      {
        x: anchorRect.x + 48,
        y: anchorRect.y + 36,
        width,
        height,
      },
      bounds,
      desktopWindowEdgeInset,
    )
  }

  useEffect(() => {
    document.body.dataset.pieceMode = 'shell'

    return () => {
      delete document.body.dataset.pieceMode
      delete document.body.dataset.windowDragging
    }
  }, [])

  useEffect(() => {
    if (!draggingWindowId) {
      delete document.body.dataset.windowDragging
      return
    }

    document.body.dataset.windowDragging = 'true'

    return () => {
      delete document.body.dataset.windowDragging
    }
  }, [draggingWindowId])

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

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const finePointerQuery = window.matchMedia(desktopFinePointerQuery)
    const updateDragEnabled = () => {
      setDragEnabled(finePointerQuery.matches)
    }

    const measureDesktop = () => {
      const shellRect = shellRef.current?.getBoundingClientRect()
      const systemBarRect = systemBarRef.current?.getBoundingClientRect()
      const dockRect = dockRef.current?.getBoundingClientRect()

      if (!shellRect || !systemBarRect || !dockRect) {
        return
      }

      const top = Math.max(systemBarRect.bottom - shellRect.top, 0)
      const bottom = Math.max(shellRect.bottom - dockRect.top, 0)
      const nextMetrics: DesktopMetrics = {
        top,
        bottom,
        width: shellRect.width,
        height: Math.max(shellRect.height - top - bottom, 0),
      }

      setDesktopMetrics((current) => {
        if (
          current &&
          current.top === nextMetrics.top &&
          current.bottom === nextMetrics.bottom &&
          current.width === nextMetrics.width &&
          current.height === nextMetrics.height
        ) {
          return current
        }

        return nextMetrics
      })
    }

    updateDragEnabled()
    measureDesktop()

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            measureDesktop()
          })

    if (resizeObserver) {
      if (shellRef.current) {
        resizeObserver.observe(shellRef.current)
      }

      if (systemBarRef.current) {
        resizeObserver.observe(systemBarRef.current)
      }

      if (dockRef.current) {
        resizeObserver.observe(dockRef.current)
      }
    }

    window.addEventListener('resize', measureDesktop)
    finePointerQuery.addEventListener('change', updateDragEnabled)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measureDesktop)
      finePointerQuery.removeEventListener('change', updateDragEnabled)
    }
  }, [])

  useEffect(() => {
    if (!desktopBounds) {
      return
    }

    setWindowRects((current) => {
      const next = { ...current }
      const nextLauncherRect = clampRectToBounds(
        current[launcherWindowId] ??
          launcherLastKnownRectRef.current ??
          getLauncherDefaultRect(desktopBounds),
        desktopBounds,
        desktopWindowEdgeInset,
      )
      const nextAboutRect = clampRectToBounds(
        current[aboutWindowId] ??
          aboutLastKnownRectRef.current ??
          getAboutDefaultRect(desktopBounds, nextLauncherRect),
        desktopBounds,
        desktopWindowEdgeInset,
      )
      const nextProjectRect = projectWindowId
        ? clampRectToBounds(
            current[projectWindowId] ??
              projectLastKnownRectsRef.current[projectWindowId] ??
              getProjectDefaultRect(desktopBounds, nextLauncherRect),
            desktopBounds,
            desktopWindowEdgeInset,
          )
        : null
      const launcherChanged = !rectEquals(current[launcherWindowId], nextLauncherRect)
      const aboutChanged = !rectEquals(current[aboutWindowId], nextAboutRect)
      const projectChanged =
        projectWindowId !== null &&
        !rectEquals(current[projectWindowId], nextProjectRect)

      if (!launcherChanged && !aboutChanged && !projectChanged) {
        return current
      }

      next[launcherWindowId] = nextLauncherRect
      next[aboutWindowId] = nextAboutRect

      if (projectWindowId && nextProjectRect) {
        next[projectWindowId] = nextProjectRect
      }

      return next
    })
  }, [desktopBounds, projectWindowId])

  useEffect(() => {
    const launcherRect = windowRects[launcherWindowId]

    if (launcherRect) {
      launcherLastKnownRectRef.current = launcherRect
    }
  }, [windowRects])

  useEffect(() => {
    const aboutRect = windowRects[aboutWindowId]

    if (aboutRect) {
      aboutLastKnownRectRef.current = aboutRect
    }
  }, [windowRects])

  useEffect(() => {
    if (!projectWindowId) {
      return
    }

    const projectRect = windowRects[projectWindowId]

    if (projectRect) {
      projectLastKnownRectsRef.current[projectWindowId] = projectRect
    }
  }, [projectWindowId, windowRects])

  useEffect(() => {
    if (!projectWindowId) {
      return
    }

    previousProjectWindowIdRef.current = projectWindowId
    setWindowOrder((current) => {
      const next = moveIdToEnd(current, projectWindowId)
      return orderEquals(current, next) ? current : next
    })
    setActiveWindowId(projectWindowId)
  }, [projectWindowId])

  useEffect(() => {
    const previousProjectWindowId = previousProjectWindowIdRef.current

    if (projectWindowId || !previousProjectWindowId) {
      return
    }

    previousProjectWindowIdRef.current = null

    if (dragSessionRef.current?.windowId === previousProjectWindowId) {
      dragSessionRef.current = null
      setDraggingWindowId(null)
    }
  }, [projectWindowId])

  useEffect(() => {
    const openWindowIds = [
      ...(isLauncherOpen ? [launcherWindowId] : []),
      ...(isAboutOpen ? [aboutWindowId] : []),
      ...(projectWindowId ? [projectWindowId] : []),
    ]

    setWindowOrder((current) => {
      const next = [
        ...current.filter((windowId) => openWindowIds.includes(windowId)),
        ...openWindowIds.filter((windowId) => !current.includes(windowId)),
      ]

      return orderEquals(current, next) ? current : next
    })

    setActiveWindowId((current) => {
      if (current && openWindowIds.includes(current)) {
        return current
      }

      return openWindowIds.at(-1) ?? null
    })
  }, [isAboutOpen, isLauncherOpen, projectWindowId])

  useEffect(() => {
    if (dragEnabled || draggingWindowId === null) {
      return
    }

    dragSessionRef.current = null
    const frameId = window.requestAnimationFrame(() => {
      setDraggingWindowId(null)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [dragEnabled, draggingWindowId])

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
    navigate(hasMissingProject ? '/' : location.pathname, {
      replace: true,
      state: buildShellRouteState(nextView, nextRootViewMode),
    })
  }

  const updateView = (nextView: ShellView) => {
    setView(nextView)
    syncShellState(nextView)
  }

  const recoverToShell = (nextView: ShellView) => {
    setView(nextView)
    navigate('/', {
      replace: true,
      state: buildShellRouteState(nextView),
    })
  }

  const updateRootViewMode = (nextMode: RootViewMode) => {
    setRootViewMode(nextMode)
    syncShellState(view, nextMode)
  }

  const currentTitle = hasMissingProject
    ? 'Project unavailable'
    : view === 'root'
      ? "Kris' Lab"
      : 'Projects'

  const currentPathLabel = hasMissingProject
    ? 'Project unavailable'
    : view === 'root'
      ? "Kris' Lab"
      : 'Projects'

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

  function openRootEntry(entryId: RootEntryId) {
    if (entryId === 'about') {
      openWindow(aboutWindowId)
      return
    }

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

  const openProject = (project: PublicProjectEntry) => {
    navigate(getProjectPath(project.slug), {
      state: { fromLab: true, shellView: view, rootViewMode },
    })
  }

  function openWindow(windowId: string) {
    if (windowId === launcherWindowId) {
      setIsLauncherOpen(true)
    }

    if (windowId === aboutWindowId) {
      setIsAboutOpen(true)
    }

    activateWindow(windowId)
  }

  function closeWindow(windowId: string) {
    if (windowId === launcherWindowId) {
      setIsLauncherOpen(false)
    }

    if (windowId === aboutWindowId) {
      setIsAboutOpen(false)
    }

    if (dragSessionRef.current?.windowId === windowId) {
      dragSessionRef.current = null
      setDraggingWindowId(null)
    }

    setWindowOrder((current) => current.filter((candidate) => candidate !== windowId))
    setActiveWindowId((current) => (current === windowId ? null : current))
  }

  const closeProject = () => {
    if (!projectWindowId || !hasProjectWindow) {
      return
    }

    navigate('/', {
      replace: true,
      state: { shellView: view, rootViewMode },
    })
  }

  const setWindowRect = (windowId: string, nextRect: WindowRect) => {
    setWindowRects((current) => {
      if (rectEquals(current[windowId], nextRect)) {
        return current
      }

      return {
        ...current,
        [windowId]: nextRect,
      }
    })
  }

  function activateWindow(windowId: string) {
    setWindowOrder((current) => {
      const next = moveIdToEnd(current, windowId)
      return orderEquals(current, next) ? current : next
    })
    setActiveWindowId((current) => (current === windowId ? current : windowId))
  }

  const handleDesktopPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return
    }

    const target = event.target instanceof HTMLElement ? event.target : null

    if (target?.closest('[data-desktop-window-id]')) {
      return
    }

    setActiveWindowId(null)
  }

  const handleWindowFramePointerDownCapture = (windowId: string) => {
    activateWindow(windowId)
  }

  const handleWindowTitlebarPointerDown = (
    windowId: string,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (!dragEnabled || !desktopBounds || event.button !== 0) {
      return
    }

    const target = event.target instanceof HTMLElement ? event.target : null

    if (target?.closest('[data-window-control]')) {
      return
    }

    const startRect = windowRects[windowId]

    if (!startRect) {
      return
    }

    event.preventDefault()
    activateWindow(windowId)
    event.currentTarget.setPointerCapture(event.pointerId)
    dragSessionRef.current = {
      bounds: desktopBounds,
      hasCrossedThreshold: false,
      pointerId: event.pointerId,
      startPointer: {
        x: event.clientX,
        y: event.clientY,
      },
      startRect,
      windowId,
    }
  }

  const handleWindowTitlebarPointerMove = (
    windowId: string,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const dragSession = dragSessionRef.current

    if (
      !dragSession ||
      dragSession.windowId !== windowId ||
      dragSession.pointerId !== event.pointerId
    ) {
      return
    }

    const deltaX = event.clientX - dragSession.startPointer.x
    const deltaY = event.clientY - dragSession.startPointer.y

    if (!dragSession.hasCrossedThreshold) {
      if (Math.hypot(deltaX, deltaY) < desktopDragThreshold) {
        return
      }

      dragSession.hasCrossedThreshold = true
      setDraggingWindowId(windowId)
    }

    const nextRect = clampRectToBounds(
      {
        ...dragSession.startRect,
        x: dragSession.startRect.x + deltaX,
        y: dragSession.startRect.y + deltaY,
      },
      dragSession.bounds,
      desktopWindowEdgeInset,
    )

    setWindowRect(windowId, nextRect)
  }

  const finishWindowTitlebarDrag = (
    windowId: string,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    const dragSession = dragSessionRef.current

    if (
      !dragSession ||
      dragSession.windowId !== windowId ||
      dragSession.pointerId !== event.pointerId
    ) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    dragSessionRef.current = null
    setDraggingWindowId((current) => (current === windowId ? null : current))
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
      id: 'projects',
      label: 'Projects',
      caption: 'Public projects',
      meta: `${pieces.length} ${pieces.length === 1 ? 'public project' : 'public projects'}`,
    },
    {
      id: 'about',
      label: 'About',
      caption: 'Open note',
      meta: 'Shell document',
    },
  ]

  const launcherRect =
    isLauncherOpen && desktopBounds
      ? windowRects[launcherWindowId] ?? getLauncherDefaultRect(desktopBounds)
      : null
  const aboutRect =
    isAboutOpen && desktopBounds
      ? windowRects[aboutWindowId] ?? getAboutDefaultRect(desktopBounds, launcherRect)
      : null
  const projectRect =
    projectWindowId && desktopBounds
      ? windowRects[projectWindowId] ??
        getProjectDefaultRect(desktopBounds, launcherRect)
      : null
  const desktopWindows: ShellWindowRecord[] = []

  if (isLauncherOpen && launcherRect) {
    desktopWindows.push({
      id: launcherApp.windowId,
      appId: launcherApp.id,
      kind: launcherApp.kind,
      rect: launcherRect,
      minWidth: launcherWindowDefaults.minWidth,
      minHeight: launcherWindowDefaults.minHeight,
    })
  }

  if (isAboutOpen && aboutRect) {
    desktopWindows.push({
      id: aboutApp.windowId,
      appId: aboutApp.id,
      kind: aboutApp.kind,
      rect: aboutRect,
      minWidth: aboutWindowDefaults.minWidth,
      minHeight: aboutWindowDefaults.minHeight,
    })
  }

  if (projectApp && projectWindowId && projectRect) {
    desktopWindows.push({
      id: projectApp.windowId,
      appId: projectApp.id,
      kind: projectApp.kind,
      rect: projectRect,
      minWidth: projectWindowDefaults.minWidth,
      minHeight: projectWindowDefaults.minHeight,
    })
  }

  const windowsById = Object.fromEntries(
    desktopWindows.map((desktopWindow) => [desktopWindow.id, desktopWindow]),
  ) as Record<string, ShellWindowRecord>
  const orderedWindowIds = [
    ...windowOrder.filter((windowId) => windowsById[windowId]),
    ...desktopWindows
      .map((desktopWindow) => desktopWindow.id)
      .filter((windowId) => !windowOrder.includes(windowId)),
  ]
  const desktopStyle = desktopMetrics
    ? {
        top: `${desktopMetrics.top}px`,
        bottom: `${desktopMetrics.bottom}px`,
      }
    : undefined
  const aboutDocument = (
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
  )

  const launcherWindowContent = (
    <div className="shell-window" role="application" aria-label="Kris' Lab launcher">
      <header
        className="shell-window__titlebar"
        data-window-drag-handle="titlebar"
        onPointerCancel={(event) => finishWindowTitlebarDrag(launcherWindowId, event)}
        onPointerDown={(event) => handleWindowTitlebarPointerDown(launcherWindowId, event)}
        onPointerMove={(event) => handleWindowTitlebarPointerMove(launcherWindowId, event)}
        onPointerUp={(event) => finishWindowTitlebarDrag(launcherWindowId, event)}
      >
        <div className="shell-window__traffic" data-window-control="traffic" aria-hidden="true">
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
          onClick={() => {
            if (hasMissingProject) {
              recoverToShell('root')
              return
            }

            updateView('root')
          }}
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
                onClick={() => {
                  if (hasMissingProject) {
                    recoverToShell('root')
                    return
                  }

                  updateView('root')
                }}
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
                  className={`shell-sidebar__item shell-sidebar__item--child${sidebarView === 'projects' ? ' is-active' : ''}`}
                  onClick={() => {
                    if (hasMissingProject) {
                      recoverToShell('projects')
                      return
                    }

                    updateView('projects')
                  }}
                >
                  <span className="shell-sidebar__item-main">
                    <SidebarFolderIcon className="shell-sidebar__item-icon" />
                    <span className="shell-sidebar__item-label">Projects</span>
                  </span>
                  <span className="shell-sidebar__item-count">{pieces.length.toString()}</span>
                </button>

                <button
                  type="button"
                  className="shell-sidebar__item shell-sidebar__item--child"
                  onClick={() => openWindow(aboutWindowId)}
                >
                  <span className="shell-sidebar__item-main">
                    <SidebarDocumentIcon className="shell-sidebar__item-icon" />
                    <span className="shell-sidebar__item-label">Open About</span>
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
                onReturn={() => recoverToShell('projects')}
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
                      <LauncherFolderIcon className="shell-icon-item__folder" />
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

          {!hasMissingProject && view === 'projects' ? (
            <section className="shell-view shell-view--list">
              <AppList pieces={pieces} onOpenProject={openProject} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )

  const aboutWindowContent = (
    <section className="about-window-shell" aria-label="About note">
      <div className="about-window">
        <header
          className="shell-window__titlebar about-window__titlebar"
          data-window-drag-handle="titlebar"
          onPointerCancel={(event) => finishWindowTitlebarDrag(aboutWindowId, event)}
          onPointerDown={(event) => handleWindowTitlebarPointerDown(aboutWindowId, event)}
          onPointerMove={(event) => handleWindowTitlebarPointerMove(aboutWindowId, event)}
          onPointerUp={(event) => finishWindowTitlebarDrag(aboutWindowId, event)}
        >
          <div className="shell-window__traffic about-window__traffic" data-window-control="traffic">
            <button
              type="button"
              className="about-window__close shell-window__traffic-light shell-window__traffic-light--close"
              data-window-control="close"
              onClick={() => closeWindow(aboutWindowId)}
              aria-label="Close About"
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

          <div className="shell-window__title">About.md</div>

          <div className="shell-window__title-spacer" aria-hidden="true" />
        </header>

        <section className="about-window__stage" aria-label="About document viewport">
          {aboutDocument}
        </section>
      </div>
    </section>
  )

  return (
    <motion.main
      ref={shellRef}
      className="shell-route"
      data-window-dragging={draggingWindowId ? 'true' : undefined}
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
      <header ref={systemBarRef} className="shell-system-bar" aria-label="System status bar">
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

      <div className="shell-route__viewport" aria-hidden="true" />

      <div
        className="shell-route__desktop"
        style={desktopStyle}
        onPointerDown={handleDesktopPointerDown}
      >
        {orderedWindowIds.map((windowId, index) => {
          const desktopWindow = windowsById[windowId]

          if (!desktopWindow) {
            return null
          }

          const isActive = activeWindowId === windowId
          const isDragging = draggingWindowId === windowId

          return (
            <div
              key={desktopWindow.id}
              className={[
                'shell-desktop__window-frame',
                `shell-desktop__window-frame--${desktopWindow.kind}`,
                isActive ? 'is-active' : 'is-inactive',
                isDragging ? 'is-dragging' : '',
              ].filter(Boolean).join(' ')}
              data-shell-app-id={desktopWindow.appId}
              data-desktop-window-id={desktopWindow.id}
              style={{
                left: `${desktopWindow.rect.x}px`,
                top: `${desktopWindow.rect.y}px`,
                width: `${desktopWindow.rect.width}px`,
                height: `${desktopWindow.rect.height}px`,
                zIndex: index + 1,
              }}
              onPointerDownCapture={() => handleWindowFramePointerDownCapture(desktopWindow.id)}
            >
              {desktopWindow.kind === 'launcher' ? (
                launcherWindowContent
              ) : desktopWindow.kind === 'about' ? (
                aboutWindowContent
              ) : projectApp && activeProject && projectWindowId === desktopWindow.id ? (
                <ProjectWindow
                  piece={activeProject}
                  onClose={closeProject}
                  onTitlebarPointerCancel={(event) => finishWindowTitlebarDrag(desktopWindow.id, event)}
                  onTitlebarPointerDown={(event) => handleWindowTitlebarPointerDown(desktopWindow.id, event)}
                  onTitlebarPointerMove={(event) => handleWindowTitlebarPointerMove(desktopWindow.id, event)}
                  onTitlebarPointerUp={(event) => finishWindowTitlebarDrag(desktopWindow.id, event)}
                />
              ) : null}
            </div>
          )
        })}
      </div>

      <nav ref={dockRef} className="shell-dock" aria-label="Dock">
        <div className="shell-dock__inner" onPointerLeave={() => hideDockTooltip(true)}>
          {dockItems.map((item) => {
            const handleActivate = () => {
              if (hasMissingProject) {
                recoverToShell('root')
                openWindow(launcherWindowId)
                return
              }

              updateView('root')
              if (isLauncherOpen) {
                activateWindow(launcherWindowId)
                return
              }

              openWindow(launcherWindowId)
            }

            return (
              <DockIconButton
                key={item.id}
                label={item.label}
                kind={item.kind}
                isActive={isLauncherOpen}
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
                <LauncherGlyphIcon className="shell-dock__launcher" />
              </DockIconButton>
            )
          })}
        </div>
      </nav>
    </motion.main>
  )
}
