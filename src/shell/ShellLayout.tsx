import { AnimatePresence, motion } from 'motion/react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type ReactNode,
  type SVGProps,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProjectPath } from '../lib/navigation'
import { ProjectWindow } from '../host/ProjectWindow'
import { shellEase } from '../lib/motion'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import {
  clampRectToBounds,
  moveIdToEnd,
  rectEquals,
  type DesktopBounds,
  type WindowRect,
} from '../lib/windowing'
import personalLogoUrl from '../assets/Kristjan_Toplak_Logo_Black.svg'
import noteBugUrl from './backgrounds/assets/note/Bug.svg'
import noteCursorUrl from './backgrounds/assets/note/Cursor.svg'
import profilePhotoUrl from './backgrounds/assets/note/Kristjan_Toplak_Profile.webp'
import verifiedBadgeUrl from './backgrounds/assets/note/Verified_Badge.svg'
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
import { WeatherWidget } from './WeatherWidget'
import {
  isShellBackgroundId,
  shellBackgroundOptions,
  type ShellBackgroundDefinition,
  type ShellBackgroundId,
} from './backgrounds'
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

interface BackgroundMenuButtonProps {
  reducedMotion: boolean
  selectedBackground: ShellBackgroundDefinition
  onSelectBackground: (backgroundId: ShellBackgroundId) => void
}

interface ShellDockProps {
  dockRef: RefObject<HTMLElement | null>
  reducedMotion: boolean
  isLauncherOpen: boolean
  onActivateLauncher: () => void
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

interface ClosingProjectSnapshot {
  app: ProjectAppRecord
  piece: PublicProjectEntry
  rect: WindowRect
}

interface DesktopObjectDragSession {
  bounds: DesktopBounds
  hasCrossedThreshold: boolean
  pointerId: number
  startPointer: {
    x: number
    y: number
  }
  startRect: WindowRect
}

const dockItems: DockItem[] = [
  { id: launcherAppId, label: 'Launcher', kind: 'launcher' },
]
const systemBarMenuItems = [
  { label: 'File', collapseClassName: '' },
  { label: 'Edit', collapseClassName: '' },
  { label: 'View', collapseClassName: 'shell-system-bar__menu-item--view' },
  { label: 'Go', collapseClassName: 'shell-system-bar__menu-item--go' },
  { label: 'Window', collapseClassName: 'shell-system-bar__menu-item--window' },
  { label: 'Background', collapseClassName: 'shell-system-bar__menu-item--background' },
] as const
const systemBarStatusSlotClasses = [
  'shell-system-bar__status-icon--search',
  'shell-system-bar__status-icon--launchpad',
  'shell-system-bar__status-icon--notifications',
] as const

const desktopDragThreshold = 2
const desktopWindowEdgeInset = 3
const desktopFinePointerQuery = '(hover: hover) and (pointer: fine)'
const aboutWindowSessionKey = 'kris-lab.about-window-opened'
const shellBackgroundSessionStorageKey = 'kris-lab.shell-background'
const weatherWidgetDesktopObjectId = 'desktop-object:weather'
const launcherLocalTransitionDuration = 120
const launcherContentEnterDuration = 140
const launcherContentExitDuration = 110
const windowLifecycleCloseDuration = 120
const windowLifecycleForegroundDuration = 120
const shellMenuBarDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const launcherWindowDefaults = {
  height: 560,
  minHeight: 420,
  minWidth: 720,
  width: 1104,
}

const aboutWindowDefaults = {
  height: 353,
  minHeight: 340,
  minWidth: 600,
  width: 624,
}

const projectWindowDefaults = {
  height: 596,
  minHeight: 460,
  minWidth: 780,
  width: 1148,
}

const weatherWidgetDefaults = {
  height: 176,
  width: 332,
}

function getWeatherWidgetDefaultRect(bounds: DesktopBounds): WindowRect {
  const width = Math.min(weatherWidgetDefaults.width, Math.max(bounds.width - 24, 284))
  const height = Math.min(weatherWidgetDefaults.height, Math.max(bounds.height - 24, 160))

  return clampRectToBounds(
    {
      x: bounds.width - width - 24,
      y: 20,
      width,
      height,
    },
    bounds,
    desktopWindowEdgeInset,
  )
}

function getCenteredAboutWindowRect(bounds: DesktopBounds): WindowRect {
  const width = Math.min(aboutWindowDefaults.width, Math.max(bounds.width - 24, 360))
  const height = Math.min(aboutWindowDefaults.height, Math.max(bounds.height - 24, 320))

  return clampRectToBounds(
    {
      x: Math.round((bounds.width - width) / 2),
      y: Math.round(Math.max((bounds.height - height) / 2, 18)),
      width,
      height,
    },
    bounds,
    desktopWindowEdgeInset,
  )
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

function addWindowId(current: string[], windowId: string) {
  return current.includes(windowId) ? current : [...current, windowId]
}

function removeWindowId(current: string[], windowId: string) {
  return current.filter((candidate) => candidate !== windowId)
}

function readStoredShellBackgroundId(): ShellBackgroundId {
  if (typeof window === 'undefined') {
    return 'animated'
  }

  try {
    const storedValue = window.sessionStorage.getItem(shellBackgroundSessionStorageKey)

    if (storedValue && isShellBackgroundId(storedValue)) {
      return storedValue
    }
  } catch {
    // Ignore session storage failures and fall back to the animated default.
  }

  return 'animated'
}

function getLauncherToolbarTransition(reducedMotion: boolean) {
  if (reducedMotion) {
    return {}
  }

  return {
    initial: { opacity: 0, y: 2 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: launcherLocalTransitionDuration / 1000, ease: shellEase },
    },
    exit: {
      opacity: 0,
      y: -1,
      transition: { duration: 0.1, ease: shellEase },
    },
  }
}

function getLauncherContentTransition(reducedMotion: boolean) {
  if (reducedMotion) {
    return {}
  }

  return {
    initial: { opacity: 0, y: 3 },
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
}

function MenuBarClock() {
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const label = shellMenuBarDateTimeFormatter.format(currentTime)

  return (
    <span className="shell-system-bar__time" aria-label={`Local date and time ${label}`}>
      {label}
    </span>
  )
}

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
        d="M9.4 3.4L5.55 8L9.4 12.6"
        stroke="currentColor"
        strokeWidth="1.6"
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
        d="M4.45 6.45L8 9.95L11.55 6.45"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3.85 8.2L6.7 11.05L12.25 5.55"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconGridViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <rect x="2.55" y="2.55" width="4.7" height="4.7" rx="1.2" fill="currentColor" />
      <rect x="10.75" y="2.55" width="4.7" height="4.7" rx="1.2" fill="currentColor" />
      <rect x="2.55" y="10.75" width="4.7" height="4.7" rx="1.2" fill="currentColor" />
      <rect x="10.75" y="10.75" width="4.7" height="4.7" rx="1.2" fill="currentColor" />
    </svg>
  )
}

function ListViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <circle cx="3.75" cy="4.25" r="1.02" fill="currentColor" />
      <circle cx="3.75" cy="9" r="1.02" fill="currentColor" />
      <circle cx="3.75" cy="13.75" r="1.02" fill="currentColor" />
      <path d="M6.9 4.25H14.35" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M6.9 9H14.35" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      <path d="M6.9 13.75H14.35" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
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
  const [isBouncing, setIsBouncing] = useState(false)
  const bounceFrameRef = useRef<number | null>(null)

  const resetPressState = () => {
    setIsPressing(false)
  }

  const restartBounce = () => {
    if (bounceFrameRef.current !== null) {
      window.cancelAnimationFrame(bounceFrameRef.current)
      bounceFrameRef.current = null
    }

    setIsBouncing(false)
    bounceFrameRef.current = window.requestAnimationFrame(() => {
      setIsBouncing(true)
      bounceFrameRef.current = null
    })
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
    setIsPressing(false)
    onActivate?.()

    if (!disabled && !reducedMotion) {
      restartBounce()
    }
  }

  useEffect(() => {
    return () => {
      if (bounceFrameRef.current !== null) {
        window.cancelAnimationFrame(bounceFrameRef.current)
        bounceFrameRef.current = null
      }
    }
  }, [])

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
          className={[
            'shell-dock__icon-frame',
            isBouncing ? 'is-bouncing' : '',
          ].filter(Boolean).join(' ')}
          onAnimationEnd={(event) => {
            if (event.animationName === 'shell-dock-bounce') {
              setIsBouncing(false)
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

function BackgroundMenuButton({
  reducedMotion,
  selectedBackground,
  onSelectBackground,
}: BackgroundMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Node ? event.target : null

      if (target && menuRef.current?.contains(target)) {
        return
      }

      setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div
      ref={menuRef}
      className={[
        'shell-system-bar__menu-group',
        'shell-system-bar__menu-item--background',
        isOpen ? 'is-open' : '',
      ].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={[
          'shell-system-bar__button',
          'shell-system-bar__button--interactive',
          'shell-system-bar__menu-item',
          'shell-system-bar__menu-trigger',
        ].join(' ')}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>Background</span>
        <ChevronDownIcon className="shell-system-bar__menu-caret" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            id={menuId}
            className="shell-background-menu"
            role="menu"
            aria-label="Desktop backgrounds"
            initial={reducedMotion ? false : { opacity: 0, y: -2 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -1 }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 0.13, ease: shellEase }
            }
          >
            <div className="shell-background-menu__list" role="none">
              {shellBackgroundOptions.map((option) => {
                const isSelected = option.id === selectedBackground.id

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    className={[
                      'shell-background-menu__option',
                      isSelected ? 'is-selected' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => {
                      onSelectBackground(option.id)
                      setIsOpen(false)
                    }}
                  >
                    <span
                      className={[
                        'shell-background-menu__preview',
                        option.kind === 'animated'
                          ? 'shell-background-menu__preview--animated'
                          : '',
                      ].filter(Boolean).join(' ')}
                      aria-hidden="true"
                    >
                      {option.previewSrc ? (
                        <img src={option.previewSrc} alt="" decoding="async" />
                      ) : (
                        <span className="shell-background-menu__preview-animated-dot" />
                      )}
                    </span>
                    <span className="shell-background-menu__label">{option.label}</span>
                    <span className="shell-background-menu__check" aria-hidden="true">
                      {isSelected ? <CheckIcon /> : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function ShellDock({
  dockRef,
  reducedMotion,
  isLauncherOpen,
  onActivateLauncher,
}: ShellDockProps) {
  const [hoveredDockItemId, setHoveredDockItemId] = useState<string | null>(null)
  const dockTooltipTimerRef = useRef<number | null>(null)
  const dockTooltipPrimedRef = useRef(false)

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

  useEffect(() => {
    return () => {
      if (dockTooltipTimerRef.current !== null) {
        window.clearTimeout(dockTooltipTimerRef.current)
        dockTooltipTimerRef.current = null
      }
    }
  }, [])

  return (
    <nav ref={dockRef} className="shell-dock" aria-label="Dock">
      <div className="shell-dock__inner" onPointerLeave={() => hideDockTooltip(true)}>
        {dockItems.map((item) => {
          return (
            <DockIconButton
              key={item.id}
              label={item.label}
              kind={item.kind}
              isActive={isLauncherOpen}
              reducedMotion={reducedMotion}
              onActivate={onActivateLauncher}
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
        strokeOpacity="0.24"
        strokeWidth="0.85"
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
        strokeWidth="1.05"
        strokeLinejoin="round"
        strokeOpacity="0.64"
      />
      <path d="M5.15 7.25H9.55" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" strokeOpacity="0.72" />
      <path d="M5.15 9.25H8.95" stroke="currentColor" strokeWidth="0.95" strokeLinecap="round" strokeOpacity="0.58" />
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
  const [windowOrder, setWindowOrder] = useState<string[]>(() => {
    if (initialProjectWindowId) {
      return [initialProjectWindowId]
    }

    return initialAboutWindowOpen ? [aboutWindowId] : []
  })
  const [windowRects, setWindowRects] = useState<Record<string, WindowRect>>({})
  const [enteringWindowIds, setEnteringWindowIds] = useState<string[]>([])
  const [closingWindowIds, setClosingWindowIds] = useState<string[]>([])
  const [foregroundingWindowIds, setForegroundingWindowIds] = useState<string[]>([])
  const [closingProjectSnapshot, setClosingProjectSnapshot] = useState<ClosingProjectSnapshot | null>(null)
  const [selectedBackgroundId, setSelectedBackgroundId] = useState<ShellBackgroundId>(() =>
    readStoredShellBackgroundId(),
  )
  const [weatherWidgetRect, setWeatherWidgetRect] = useState<WindowRect | null>(null)
  const [isWeatherWidgetDragging, setIsWeatherWidgetDragging] = useState(false)
  const shellRef = useRef<HTMLElement>(null)
  const systemBarRef = useRef<HTMLElement>(null)
  const dockRef = useRef<HTMLElement>(null)
  const shellBoundsRef = useRef({ left: 0, top: 0 })
  const windowFrameRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const weatherWidgetFrameRef = useRef<HTMLDivElement | null>(null)
  const dragSessionRef = useRef<DragSession | null>(null)
  const draggedWindowRectRef = useRef<WindowRect | null>(null)
  const weatherWidgetDragSessionRef = useRef<DesktopObjectDragSession | null>(null)
  const draggedWeatherWidgetRectRef = useRef<WindowRect | null>(null)
  const previousProjectWindowIdRef = useRef<string | null>(null)
  const hasMountedRef = useRef(false)
  const launcherLastKnownRectRef = useRef<WindowRect | null>(null)
  const aboutLastKnownRectRef = useRef<WindowRect | null>(null)
  const projectLastKnownRectsRef = useRef<Record<string, WindowRect>>({})
  const enteringFrameRef = useRef<Record<string, number[]>>({})
  const closingTimerRef = useRef<Record<string, number>>({})
  const foregroundingTimerRef = useRef<Record<string, number>>({})
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
  const selectedBackground = useMemo<ShellBackgroundDefinition>(
    () =>
      shellBackgroundOptions.find((option) => option.id === selectedBackgroundId) ??
      shellBackgroundOptions[0],
    [selectedBackgroundId],
  )
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
    const centeredRect = getCenteredAboutWindowRect(bounds)
    const width = centeredRect.width
    const height = centeredRect.height

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
    const enteringFrames = enteringFrameRef.current
    const closingTimers = closingTimerRef.current
    const foregroundingTimers = foregroundingTimerRef.current

    document.body.dataset.pieceMode = 'shell'

    return () => {
      Object.values(enteringFrames).forEach((frameIds) => {
        frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId))
      })
      Object.values(closingTimers).forEach((timerId) => {
        window.clearTimeout(timerId)
      })
      Object.values(foregroundingTimers).forEach((timerId) => {
        window.clearTimeout(timerId)
      })
      delete document.body.dataset.pieceMode
      delete document.body.dataset.windowDragging
    }
  }, [])

  useEffect(() => {
    if (!draggingWindowId && !isWeatherWidgetDragging) {
      delete document.body.dataset.windowDragging
      return
    }

    document.body.dataset.windowDragging = 'true'

    return () => {
      delete document.body.dataset.windowDragging
    }
  }, [draggingWindowId, isWeatherWidgetDragging])

  useEffect(() => {
    try {
      window.sessionStorage.setItem(shellBackgroundSessionStorageKey, selectedBackgroundId)
    } catch {
      // Ignore storage failures and keep the current selection in memory.
    }
  }, [selectedBackgroundId])

  useEffect(() => {
    const previewSources = shellBackgroundOptions
      .map((option) => option.previewSrc)
      .filter((previewSrc): previewSrc is string => previewSrc !== null)

    if (!previewSources.length) {
      return
    }

    let isCancelled = false

    const preloadPreviewImages = () => {
      previewSources.forEach((previewSrc) => {
        const previewImage = new Image()
        previewImage.decoding = 'async'
        previewImage.src = previewSrc

        if (typeof previewImage.decode === 'function') {
          void previewImage.decode().catch(() => {
            // Ignore decode failures and fall back to normal browser caching.
          })
        }
      })
    }

    const schedulePreload = () => {
      if (isCancelled) {
        return
      }

      preloadPreviewImages()
    }

    const requestIdleCallback = window.requestIdleCallback?.bind(window)
    const cancelIdleCallback = window.cancelIdleCallback?.bind(window)

    if (requestIdleCallback && cancelIdleCallback) {
      const idleCallbackId = requestIdleCallback(schedulePreload, { timeout: 240 })

      return () => {
        isCancelled = true
        cancelIdleCallback(idleCallbackId)
      }
    }

    const timeoutId = window.setTimeout(schedulePreload, 120)

    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [])

  const clearEnteringFrames = (windowId: string) => {
    const frameIds = enteringFrameRef.current[windowId]

    if (!frameIds) {
      return
    }

    frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId))
    delete enteringFrameRef.current[windowId]
  }

  const clearClosingTimer = (windowId: string) => {
    const timerId = closingTimerRef.current[windowId]

    if (timerId === undefined) {
      return
    }

    window.clearTimeout(timerId)
    delete closingTimerRef.current[windowId]
  }

  const clearForegroundingTimer = (windowId: string) => {
    const timerId = foregroundingTimerRef.current[windowId]

    if (timerId === undefined) {
      return
    }

    window.clearTimeout(timerId)
    delete foregroundingTimerRef.current[windowId]
  }

  const startEnteringWindow = (windowId: string) => {
    if (reducedMotion) {
      return
    }

    clearEnteringFrames(windowId)
    clearClosingTimer(windowId)
    setClosingWindowIds((current) => removeWindowId(current, windowId))
    setEnteringWindowIds((current) => addWindowId(current, windowId))

    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(() => {
        setEnteringWindowIds((current) => removeWindowId(current, windowId))
        delete enteringFrameRef.current[windowId]
      })

      enteringFrameRef.current[windowId] = [firstFrame, secondFrame]
    })

    enteringFrameRef.current[windowId] = [firstFrame]
  }

  const startForegroundingWindow = (windowId: string) => {
    if (reducedMotion) {
      return
    }

    clearForegroundingTimer(windowId)
    setForegroundingWindowIds((current) => addWindowId(current, windowId))
    foregroundingTimerRef.current[windowId] = window.setTimeout(() => {
      setForegroundingWindowIds((current) => removeWindowId(current, windowId))
      delete foregroundingTimerRef.current[windowId]
    }, windowLifecycleForegroundDuration)
  }

  const finalizeWindowClose = (windowId: string) => {
    clearClosingTimer(windowId)
    clearEnteringFrames(windowId)
    clearForegroundingTimer(windowId)
    setEnteringWindowIds((current) => removeWindowId(current, windowId))
    setClosingWindowIds((current) => removeWindowId(current, windowId))
    setForegroundingWindowIds((current) => removeWindowId(current, windowId))

    if (windowId === launcherWindowId) {
      setIsLauncherOpen(false)
    }

    if (windowId === aboutWindowId) {
      setIsAboutOpen(false)
    }

    setClosingProjectSnapshot((current) =>
      current?.app.windowId === windowId ? null : current,
    )

    if (dragSessionRef.current?.windowId === windowId) {
      dragSessionRef.current = null
      draggedWindowRectRef.current = null
      setDraggingWindowId(null)
    }

    delete windowFrameRefs.current[windowId]

    setWindowOrder((current) => {
      const next = current.filter((candidate) => candidate !== windowId)

      setActiveWindowId((currentActiveWindowId) =>
        currentActiveWindowId === windowId ? next.at(-1) ?? null : currentActiveWindowId,
      )

      return next
    })
  }

  const startClosingWindow = (windowId: string) => {
    if (reducedMotion) {
      finalizeWindowClose(windowId)
      return
    }

    clearEnteringFrames(windowId)
    clearClosingTimer(windowId)
    setEnteringWindowIds((current) => removeWindowId(current, windowId))
    setForegroundingWindowIds((current) => removeWindowId(current, windowId))
    setClosingWindowIds((current) => addWindowId(current, windowId))
    closingTimerRef.current[windowId] = window.setTimeout(() => {
      finalizeWindowClose(windowId)
    }, windowLifecycleCloseDuration)
  }

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

      shellBoundsRef.current = {
        left: shellRect.left,
        top: shellRect.top,
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
  }, [projectWindowId])

  useEffect(() => {
    const previousProjectWindowId = previousProjectWindowIdRef.current

    if (projectWindowId || !previousProjectWindowId || closingProjectSnapshot?.app.windowId === previousProjectWindowId) {
      return
    }

    previousProjectWindowIdRef.current = null

    if (dragSessionRef.current?.windowId === previousProjectWindowId) {
      dragSessionRef.current = null
      const frameId = window.requestAnimationFrame(() => {
        setDraggingWindowId(null)
      })

      return () => {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [closingProjectSnapshot, projectWindowId])

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

  useEffect(() => {
    if (dragEnabled || !isWeatherWidgetDragging) {
      return
    }

    weatherWidgetDragSessionRef.current = null
    const frameId = window.requestAnimationFrame(() => {
      setIsWeatherWidgetDragging(false)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [dragEnabled, isWeatherWidgetDragging])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
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

  const currentTitle = 'Launcher'

  const currentPathLabel = hasMissingProject
    ? 'Project unavailable'
    : view === 'root'
      ? "Kris' OS"
      : 'Projects'
  const launcherContentKey = hasMissingProject ? 'missing' : view === 'root' ? `root-${rootViewMode}` : 'projects'
  const launcherPathKey = hasMissingProject ? 'missing' : view
  const launcherToolbarTransition = getLauncherToolbarTransition(reducedMotion)
  const launcherContentTransition = getLauncherContentTransition(reducedMotion)

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

  const activateLauncherFromDock = () => {
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

  const openProject = (project: PublicProjectEntry) => {
    const nextProjectWindowId = createProjectWindowId(project.slug)

    if (closingProjectSnapshot?.app.windowId === nextProjectWindowId) {
      clearClosingTimer(nextProjectWindowId)
      setClosingWindowIds((current) => removeWindowId(current, nextProjectWindowId))
      setClosingProjectSnapshot(null)
    }

    if (hasMountedRef.current) {
      startEnteringWindow(nextProjectWindowId)
    }

    activateWindow(nextProjectWindowId)
    navigate(getProjectPath(project.slug), {
      state: { fromLab: true, shellView: view, rootViewMode },
    })
  }

  function openWindow(windowId: string) {
    clearClosingTimer(windowId)
    clearEnteringFrames(windowId)
    setClosingWindowIds((current) => removeWindowId(current, windowId))

    if (windowId === launcherWindowId) {
      if (!isLauncherOpen) {
        startEnteringWindow(windowId)
      }
      setIsLauncherOpen(true)
    }

    if (windowId === aboutWindowId) {
      if (!isAboutOpen) {
        startEnteringWindow(windowId)
      }
      setIsAboutOpen(true)
    }

    activateWindow(windowId)
  }

  function closeWindow(windowId: string) {
    if (!reducedMotion && closingWindowIds.includes(windowId)) {
      return
    }

    startClosingWindow(windowId)
  }

  const closeProject = () => {
    if (!projectWindowId || !hasProjectWindow) {
      return
    }

    const projectRect =
      windowRects[projectWindowId] ??
      projectLastKnownRectsRef.current[projectWindowId] ??
      (desktopBounds ? getProjectDefaultRect(desktopBounds, launcherLastKnownRectRef.current) : null)

    if (!projectRect || reducedMotion) {
      navigate('/', {
        replace: true,
        state: { shellView: view, rootViewMode },
      })
      return
    }

    setClosingProjectSnapshot({
      app: projectApp!,
      piece: activeProject!,
      rect: projectRect,
    })
    setClosingWindowIds((current) => addWindowId(current, projectWindowId))
    clearEnteringFrames(projectWindowId)
    setEnteringWindowIds((current) => removeWindowId(current, projectWindowId))
    clearClosingTimer(projectWindowId)
    closingTimerRef.current[projectWindowId] = window.setTimeout(() => {
      finalizeWindowClose(projectWindowId)
    }, windowLifecycleCloseDuration)

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

  const setWeatherWidgetRectIfNeeded = (nextRect: WindowRect) => {
    setWeatherWidgetRect((current) => {
      if (rectEquals(current, nextRect)) {
        return current
      }

      return nextRect
    })
  }

  const applyRectToElement = (node: HTMLDivElement | null, rect: WindowRect) => {
    if (!node) {
      return
    }

    node.style.left = `${rect.x}px`
    node.style.top = `${rect.y}px`
    node.style.width = `${rect.width}px`
    node.style.height = `${rect.height}px`
  }

  function activateWindow(windowId: string) {
    if (resolvedActiveWindowId !== windowId) {
      startForegroundingWindow(windowId)
    }

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

    if (target?.closest('[data-desktop-window-id]') || target?.closest('[data-desktop-object-id]')) {
      return
    }

    setActiveWindowId(null)
  }

  const hideShellCursorHalo = () => {
    shellRef.current?.style.setProperty('--shell-cursor-opacity', '0')
  }

  const handleDesktopPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isAnyDesktopDragActive) {
      hideShellCursorHalo()
      return
    }

    const target = event.target instanceof HTMLElement ? event.target : null

    if (
      target?.closest('[data-desktop-window-id]') ||
      target?.closest('[data-desktop-object-id]')
    ) {
      hideShellCursorHalo()
      return
    }

    const shellNode = shellRef.current

    if (!shellNode) {
      return
    }

    const { left, top } = shellBoundsRef.current
    shellNode.style.setProperty('--shell-cursor-x', `${event.clientX - left}px`)
    shellNode.style.setProperty('--shell-cursor-y', `${event.clientY - top}px`)
    shellNode.style.setProperty('--shell-cursor-opacity', '1')
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

    draggedWindowRectRef.current = nextRect
    applyRectToElement(windowFrameRefs.current[windowId] ?? null, nextRect)
  }

  const handleWeatherWidgetPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragEnabled || !desktopBounds || event.button !== 0 || !displayedWeatherWidgetRect) {
      return
    }

    const target = event.target instanceof HTMLElement ? event.target : null

    if (target?.closest('[data-weather-widget-interactive]')) {
      return
    }

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    weatherWidgetDragSessionRef.current = {
      bounds: desktopBounds,
      hasCrossedThreshold: false,
      pointerId: event.pointerId,
      startPointer: {
        x: event.clientX,
        y: event.clientY,
      },
      startRect: displayedWeatherWidgetRect,
    }
  }

  const handleWeatherWidgetPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragSession = weatherWidgetDragSessionRef.current

    if (!dragSession || dragSession.pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - dragSession.startPointer.x
    const deltaY = event.clientY - dragSession.startPointer.y

    if (!dragSession.hasCrossedThreshold) {
      if (Math.hypot(deltaX, deltaY) < desktopDragThreshold) {
        return
      }

      dragSession.hasCrossedThreshold = true
      setIsWeatherWidgetDragging(true)
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

    draggedWeatherWidgetRectRef.current = nextRect
    applyRectToElement(weatherWidgetFrameRef.current, nextRect)
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

    if (dragSession.hasCrossedThreshold && draggedWindowRectRef.current) {
      setWindowRect(windowId, draggedWindowRectRef.current)
    }

    dragSessionRef.current = null
    draggedWindowRectRef.current = null
    setDraggingWindowId((current) => (current === windowId ? null : current))
  }

  const finishWeatherWidgetDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragSession = weatherWidgetDragSessionRef.current

    if (!dragSession || dragSession.pointerId !== event.pointerId) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    if (dragSession.hasCrossedThreshold && draggedWeatherWidgetRectRef.current) {
      setWeatherWidgetRectIfNeeded(draggedWeatherWidgetRectRef.current)
    }

    weatherWidgetDragSessionRef.current = null
    draggedWeatherWidgetRectRef.current = null
    setIsWeatherWidgetDragging(false)
  }

  const rootEntries = useMemo<RootEntry[]>(
    () => [
      {
        id: 'projects',
        label: 'Projects',
        caption: 'Experimentations',
        meta: `${pieces.length} ${pieces.length === 1 ? 'public project' : 'public projects'}`,
      },
      {
        id: 'about',
        label: 'About',
        caption: 'Read Me',
        meta: 'Shell document',
      },
    ],
    [pieces.length],
  )

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
  const displayedWeatherWidgetRect = desktopBounds
    ? clampRectToBounds(
        weatherWidgetRect ?? getWeatherWidgetDefaultRect(desktopBounds),
        desktopBounds,
        desktopWindowEdgeInset,
      )
    : null
  const desktopWindows = useMemo<ShellWindowRecord[]>(() => {
    const nextDesktopWindows: ShellWindowRecord[] = []

    if (isLauncherOpen && launcherRect) {
      nextDesktopWindows.push({
        id: launcherApp.windowId,
        appId: launcherApp.id,
        kind: launcherApp.kind,
        rect: launcherRect,
        minWidth: launcherWindowDefaults.minWidth,
        minHeight: launcherWindowDefaults.minHeight,
      })
    }

    if (isAboutOpen && aboutRect) {
      nextDesktopWindows.push({
        id: aboutApp.windowId,
        appId: aboutApp.id,
        kind: aboutApp.kind,
        rect: aboutRect,
        minWidth: aboutWindowDefaults.minWidth,
        minHeight: aboutWindowDefaults.minHeight,
      })
    }

    if (projectApp && projectWindowId && projectRect) {
      nextDesktopWindows.push({
        id: projectApp.windowId,
        appId: projectApp.id,
        kind: projectApp.kind,
        rect: projectRect,
        minWidth: projectWindowDefaults.minWidth,
        minHeight: projectWindowDefaults.minHeight,
      })
    }

    if (
      closingProjectSnapshot &&
      (!projectApp || projectApp.windowId !== closingProjectSnapshot.app.windowId)
    ) {
      nextDesktopWindows.push({
        id: closingProjectSnapshot.app.windowId,
        appId: closingProjectSnapshot.app.id,
        kind: closingProjectSnapshot.app.kind,
        rect: closingProjectSnapshot.rect,
        minWidth: projectWindowDefaults.minWidth,
        minHeight: projectWindowDefaults.minHeight,
      })
    }

    return nextDesktopWindows
  }, [
    aboutApp.id,
    aboutApp.kind,
    aboutApp.windowId,
    aboutRect,
    closingProjectSnapshot,
    isAboutOpen,
    isLauncherOpen,
    launcherApp.id,
    launcherApp.kind,
    launcherApp.windowId,
    launcherRect,
    projectApp,
    projectRect,
    projectWindowId,
  ])
  const windowsById = useMemo(
    () =>
      Object.fromEntries(
        desktopWindows.map((desktopWindow) => [desktopWindow.id, desktopWindow]),
      ) as Record<string, ShellWindowRecord>,
    [desktopWindows],
  )
  const orderedWindowIds = useMemo(
    () => [
      ...windowOrder.filter((windowId) => windowsById[windowId]),
      ...desktopWindows
        .map((desktopWindow) => desktopWindow.id)
        .filter((windowId) => !windowOrder.includes(windowId)),
    ],
    [desktopWindows, windowOrder, windowsById],
  )
  const resolvedActiveWindowId =
    activeWindowId === null
      ? null
      : orderedWindowIds.includes(activeWindowId)
        ? activeWindowId
        : orderedWindowIds.at(-1) ?? null
  const isAnyDesktopDragActive = draggingWindowId !== null || isWeatherWidgetDragging
  const desktopStyle = desktopMetrics
    ? {
        top: `${desktopMetrics.top}px`,
        bottom: `${desktopMetrics.bottom}px`,
      }
    : undefined
  const staticShellBackgroundStyle =
    selectedBackground.kind === 'static' && selectedBackground.desktopSrc
      ? ({
          backgroundImage: `url("${selectedBackground.desktopSrc}")`,
        } satisfies CSSProperties)
      : undefined
  const aboutDocument = (
    <article className="about-note" aria-label="About note">
      <div className="about-note__body">
        <div className="about-note-composition">
          <div className="about-note-composition__avatar-wrap">
            <img
              className="about-note-composition__avatar"
              src={profilePhotoUrl}
              alt="Portrait of Kristjan Toplak"
            />
            <span className="about-note-composition__status" aria-hidden="true" />
          </div>

          <div className="about-note-composition__identity">
            <div className="about-note-composition__name-row">
              <h1 className="about-note-composition__name">Kristjan Toplak</h1>
              <img
                className="about-note-composition__badge"
                src={verifiedBadgeUrl}
                alt=""
                aria-hidden="true"
              />
            </div>

            <p className="about-note-composition__role">Product Designer</p>
          </div>

          <div className="about-note-composition__copy" aria-label="About Kris' OS">
            <p className="about-note-composition__line">
              Welcome to <span className="about-note-composition__strong">Kris&rsquo; OS</span>.{' '}
              My playground for testing ideas,
            </p>

            <p className="about-note-composition__line about-note-composition__line--bugged">
              <span>br</span>
              <span className="about-note-composition__bug-replacement" aria-hidden="true">
                <img className="about-note-composition__bug" src={noteBugUrl} alt="" />
              </span>
              <span>aking things, and building without overthinking.</span>
            </p>

            <p className="about-note-composition__line about-note-composition__line--click">
              <span className="about-note-composition__click-wrap">
                <span className="about-note-composition__click-text">Click</span>
                <img
                  className="about-note-composition__cursor"
                  src={noteCursorUrl}
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <span>&nbsp;around. Try things. Have fun{'\u270C\uFE0F'}.</span>
            </p>
          </div>
        </div>





      </div>
    </article>
  )

  const launcherWindowContent = (
    <div
      className="shell-window"
      role="application"
      aria-label="Kris' OS launcher"
    >
      <header
        className="shell-window__titlebar"
        data-window-drag-handle="titlebar"
        onPointerCancel={(event) => finishWindowTitlebarDrag(launcherWindowId, event)}
        onPointerDown={(event) => handleWindowTitlebarPointerDown(launcherWindowId, event)}
        onPointerMove={(event) => handleWindowTitlebarPointerMove(launcherWindowId, event)}
        onPointerUp={(event) => finishWindowTitlebarDrag(launcherWindowId, event)}
      >
        <div className="shell-window__traffic" data-window-control="traffic">
          <button
            type="button"
            className="shell-window__traffic-light shell-window__traffic-light--close"
            data-window-control="close"
            onClick={() => closeWindow(launcherWindowId)}
            aria-label="Close Launcher"
          />
          <span className="shell-window__traffic-light shell-window__traffic-light--minimize" />
          <span className="shell-window__traffic-light shell-window__traffic-light--maximize" />
        </div>

        <div className="shell-window__title shell-window__title--launcher">{currentTitle}</div>

        <div className="shell-window__title-spacer" aria-hidden="true" />
      </header>

      <div className="shell-window__toolbar">
        <div className="shell-toolbar__slot shell-toolbar__slot--leading">
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
        </div>

        <div className="shell-toolbar__slot shell-toolbar__slot--center">
          <div className="shell-toolbar__path" aria-label="Current location">
            {reducedMotion ? (
              <>
                <span className="shell-toolbar__path-root">Kris&apos; OS</span>
                {view !== 'root' ? (
                  <>
                    <span className="shell-toolbar__separator">/</span>
                    <span className="shell-toolbar__path-current">{currentPathLabel}</span>
                  </>
                ) : null}
              </>
            ) : (
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={launcherPathKey}
                  className="shell-toolbar__path-copy"
                  {...launcherToolbarTransition}
                >
                  <span className="shell-toolbar__path-root">Kris&apos; OS</span>
                  {view !== 'root' ? (
                    <>
                      <span className="shell-toolbar__separator">/</span>
                      <span className="shell-toolbar__path-current">{currentPathLabel}</span>
                    </>
                  ) : null}
                </motion.span>
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className="shell-toolbar__slot shell-toolbar__slot--trailing shell-toolbar__trailing">
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
                <span className="shell-sidebar__item-leading" aria-hidden="true">
                  <span className="shell-sidebar__tree-cue">
                    <ChevronDownIcon className="shell-sidebar__tree-icon" />
                  </span>
                </span>
                <span className="shell-sidebar__item-main">
                  <span className="shell-sidebar__item-label">Kris&apos; OS</span>
                </span>
                <span className="shell-sidebar__item-trailing" aria-hidden="true" />
              </button>

              <div className="shell-sidebar__children" aria-label="Kris' OS children">
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
                  <span className="shell-sidebar__item-leading" aria-hidden="true">
                    <SidebarFolderIcon className="shell-sidebar__item-icon" />
                  </span>
                  <span className="shell-sidebar__item-main">
                    <span className="shell-sidebar__item-label">Projects</span>
                  </span>
                  <span className="shell-sidebar__item-trailing">
                    <span className="shell-sidebar__item-count">{pieces.length.toString()}</span>
                  </span>
                </button>

                <button
                  type="button"
                  className="shell-sidebar__item shell-sidebar__item--child"
                  onClick={() => openWindow(aboutWindowId)}
                >
                  <span className="shell-sidebar__item-leading" aria-hidden="true">
                    <SidebarDocumentIcon className="shell-sidebar__item-icon" />
                  </span>
                  <span className="shell-sidebar__item-main">
                    <span className="shell-sidebar__item-label">About.note</span>
                  </span>
                  <span className="shell-sidebar__item-trailing" aria-hidden="true" />
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

          {!hasMissingProject ? (
            reducedMotion ? (
              view === 'root' ? (
                <section className="shell-view shell-view--icons">
                  {rootViewMode === 'grid' ? (
                    <div className="shell-icon-grid" role="list" aria-label="Root folders">
                      {rootEntries.map((entry) => (
                        <motion.button
                          key={entry.id}
                          type="button"
                          className="shell-icon-item"
                          role="listitem"
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
                        {rootEntries.map((entry) => (
                          <motion.li
                            key={entry.id}
                            className="shell-list__item"
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
              ) : (
                <section className="shell-view shell-view--list">
                  <AppList pieces={pieces} onOpenProject={openProject} />
                </section>
              )
            ) : (
              <AnimatePresence initial={false} mode="wait">
                <motion.section
                  key={launcherContentKey}
                  className={[
                    'shell-view',
                    view === 'root' ? 'shell-view--icons' : 'shell-view--list',
                  ].join(' ')}
                  {...launcherContentTransition}
                >
                  {view === 'root' ? (
                    rootViewMode === 'grid' ? (
                      <div className="shell-icon-grid" role="list" aria-label="Root folders">
                        {rootEntries.map((entry) => (
                          <motion.button
                            key={entry.id}
                            type="button"
                            className="shell-icon-item"
                            role="listitem"
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
                          {rootEntries.map((entry) => (
                            <motion.li
                              key={entry.id}
                              className="shell-list__item"
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
                    )
                  ) : (
                    <AppList pieces={pieces} onOpenProject={openProject} />
                  )}
                </motion.section>
              </AnimatePresence>
            )
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

          <div className="shell-window__title shell-window__title--about">About</div>

          <div className="shell-window__title-spacer" aria-hidden="true" />
        </header>

        <section className="about-window__stage" aria-label="About note viewport">
          {aboutDocument}
        </section>
      </div>
    </section>
  )

  return (
    <motion.main
      ref={shellRef}
      className="shell-route"
      data-shell-background-kind={selectedBackground.kind}
      data-shell-background-id={selectedBackground.id}
      data-window-dragging={isAnyDesktopDragActive ? 'true' : undefined}
      {...windowReveal}
    >
      {selectedBackground.kind === 'static' ? (
        <div
          className="shell-route__background shell-route__background--static"
          style={staticShellBackgroundStyle}
          aria-hidden="true"
        />
      ) : null}

      <header ref={systemBarRef} className="shell-system-bar" aria-label="System menu bar">
        <div className="shell-system-bar__inner">
          <div className="shell-system-bar__left">
            <button
              type="button"
              className="shell-system-bar__button shell-system-bar__logo-slot"
              tabIndex={-1}
              aria-label="Kristjan Toplak logo"
            >
              <img
                className="shell-system-bar__logo-image"
                src={personalLogoUrl}
                alt=""
                aria-hidden="true"
              />
            </button>
            {systemBarMenuItems.map((item) => (
              item.label === 'Background' ? (
                <BackgroundMenuButton
                  key={item.label}
                  reducedMotion={reducedMotion}
                  selectedBackground={selectedBackground}
                  onSelectBackground={setSelectedBackgroundId}
                />
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className={[
                    'shell-system-bar__button',
                    'shell-system-bar__menu-item',
                    item.collapseClassName,
                  ].filter(Boolean).join(' ')}
                  tabIndex={-1}
                >
                  {item.label}
                </button>
              )
            ))}
          </div>

          <div className="shell-system-bar__right">
            {systemBarStatusSlotClasses.map((statusClassName) => (
              <button
                key={statusClassName}
                type="button"
                className={[
                  'shell-system-bar__button',
                  'shell-system-bar__status-icon',
                  statusClassName,
                ].join(' ')}
                tabIndex={-1}
                aria-hidden="true"
              >
                <span className="shell-system-bar__icon-placeholder" />
              </button>
            ))}
            <MenuBarClock />
          </div>
        </div>
      </header>

      <div className="shell-route__viewport" aria-hidden="true" />

      <div
        className="shell-route__desktop"
        style={desktopStyle}
        onPointerDown={handleDesktopPointerDown}
        onPointerLeave={hideShellCursorHalo}
        onPointerMove={handleDesktopPointerMove}
      >
        {displayedWeatherWidgetRect ? (
          <div
            ref={(node) => {
              weatherWidgetFrameRef.current = node
            }}
            className={[
              'shell-desktop__object',
              'shell-desktop__object--weather',
              isWeatherWidgetDragging ? 'is-dragging' : '',
            ].filter(Boolean).join(' ')}
            data-desktop-object-id={weatherWidgetDesktopObjectId}
            style={{
              ...(isWeatherWidgetDragging
                ? {}
                : {
                    left: `${displayedWeatherWidgetRect.x}px`,
                    top: `${displayedWeatherWidgetRect.y}px`,
                    width: `${displayedWeatherWidgetRect.width}px`,
                    height: `${displayedWeatherWidgetRect.height}px`,
                  }),
              zIndex: 0,
            }}
            onPointerCancel={finishWeatherWidgetDrag}
            onPointerDown={handleWeatherWidgetPointerDown}
            onPointerMove={handleWeatherWidgetPointerMove}
            onPointerUp={finishWeatherWidgetDrag}
          >
            <WeatherWidget />
          </div>
        ) : null}

        {orderedWindowIds.map((windowId, index) => {
          const desktopWindow = windowsById[windowId]

          if (!desktopWindow) {
            return null
          }

          const isActive = resolvedActiveWindowId === windowId
          const isDragging = draggingWindowId === windowId

          return (
            <div
              key={desktopWindow.id}
              ref={(node) => {
                if (node) {
                  windowFrameRefs.current[desktopWindow.id] = node
                  return
                }

                delete windowFrameRefs.current[desktopWindow.id]
              }}
              className={[
                'shell-desktop__window-frame',
                `shell-desktop__window-frame--${desktopWindow.kind}`,
                isActive ? 'is-active' : 'is-inactive',
                enteringWindowIds.includes(desktopWindow.id) ? 'is-entering' : '',
                closingWindowIds.includes(desktopWindow.id) ? 'is-closing' : '',
                foregroundingWindowIds.includes(desktopWindow.id) ? 'is-foregrounding' : '',
                isDragging ? 'is-dragging' : '',
              ].filter(Boolean).join(' ')}
              data-shell-app-id={desktopWindow.appId}
              data-desktop-window-id={desktopWindow.id}
              style={{
                ...(isDragging
                  ? {}
                  : {
                      left: `${desktopWindow.rect.x}px`,
                      top: `${desktopWindow.rect.y}px`,
                      width: `${desktopWindow.rect.width}px`,
                      height: `${desktopWindow.rect.height}px`,
                    }),
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
              ) : closingProjectSnapshot && closingProjectSnapshot.app.windowId === desktopWindow.id ? (
                <ProjectWindow
                  piece={closingProjectSnapshot.piece}
                  onClose={() => finalizeWindowClose(desktopWindow.id)}
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

      <ShellDock
        dockRef={dockRef}
        reducedMotion={reducedMotion}
        isLauncherOpen={isLauncherOpen}
        onActivateLauncher={activateLauncherFromDock}
      />
    </motion.main>
  )
}
