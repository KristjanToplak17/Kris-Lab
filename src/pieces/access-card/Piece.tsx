import { useEffect, useRef } from 'react'
import { tsParticles, type Container as TsParticlesContainer, type ISourceOptions } from '@tsparticles/engine'
import { loadEmittersPlugin } from '@tsparticles/plugin-emitters'
import { loadSlim } from '@tsparticles/slim'
import { usePrefersReducedMotion } from '../../lib/reduced-motion'
import type { PieceComponentProps } from '../types'
import './piece.css'

const lockedDisplayCopy = '********'
const unlockedDisplayCopy = 'ADMIN'

const phaseDuration = {
  idleLocked: 520,
  entry: 980,
  scanHold: 1800,
  unlockResolved: 840,
  exit: 1260,
  reset: 220,
} as const

const exitTiming = {
  dimEnd: 260,
  fadeMinElapsed: 980,
  relockEnd: 700,
} as const

const visibilityAnchors = {
  fadeBoundaryGapPx: 44,
  offscreenGapPx: 10,
  scanRestInsetPx: 24,
  scanRestVisibleLeft: 0.8,
  rightRevealFadeThreshold: 0.30,
} as const

const entryTiming = {
  motionEndProgress: 0.92,
} as const

const buttonTiming = {
  activateDuration: 360,
  dimDuration: exitTiming.dimEnd,
  onsetDelayAfterAdmin: 40,
} as const

const scanFxTiming = {
  seamDelayMs: 40,
  seamFadeInMs: 160,
  particleDelayMs: 220,
  particleFadeInMs: 320,
  peakStartMs: 620,
  peakEndMs: 1500,
  unlockPeakHoldMs: 300,
  exitSeamFadeMs: 120,
  exitParticleHoldMs: 180,
  exitParticleFadeMs: 360,
} as const

const scanSeamStyle = {
  bloomHeightMultiplier: 1.58,
  bloomOpacity: 0.34,
  coreOpacity: 0.96,
  hostWidthPx: 8,
  leftBloomSpreadPx: 17,
  pulseStrength: 0.06,
  rightBloomSpreadPx: 3,
  thicknessPx: 0.9,
} as const

const scanParticleStyle = {
  count: 20,
  driftBiasX: -0.5,
  driftBiasY: -0.62,
  emitterInsideReaderPx: 1,
  emitterNarrowHeightPercent: 78,
  emitterNarrowWidthPercent: 4,
  emitterWideHeightPercent: 92,
  emitterWideWidthPercent: 12,
  lifeDurationRangeSeconds: [2.8, 4] as const,
  maskCenterXPercent: 88,
  maskCenterYPercent: 48,
  maskMidStopPercent: 54,
  maskOuterStopPercent: 82,
  opacityRange: [0.28, 0.6] as const,
  palette: ['#74c7ff', '#8b7dff', '#6fe4ff', '#a391ff'] as const,
  randomness: 0.16,
  sizeRange: [1.2, 2.4] as const,
  speedRange: [0.08, 0.18] as const,
  zoneHeightRatio: 1.3,
  zoneTopOffsetMultiplier: -0.2,
  zoneWidthPx: 58,
} as const

const buttonState = {
  activeColor: [255, 255, 255] as const,
  activeGlowAlpha: 0.42,
  activeGlowPx: 6.5,
  activeOpacity: 1,
  inactiveColor: [172, 180, 190] as const,
  inactiveGlowAlpha: 0.03,
  inactiveGlowPx: 0.6,
  inactiveOpacity: 0.32,
} as const

const displayOpacity = {
  decrypting: 0.82,
  locked: 0.68,
  unlocked: 0.92,
} as const

const phaseTable = [
  ['idleLocked', phaseDuration.idleLocked],
  ['entry', phaseDuration.entry],
  ['scanHold', phaseDuration.scanHold],
  ['unlockResolved', phaseDuration.unlockResolved],
  ['exit', phaseDuration.exit],
  ['reset', phaseDuration.reset],
] as const

type PhaseName = (typeof phaseTable)[number][0]

type DisplayState = {
  mode: 'decrypting' | 'locked' | 'unlocked'
  opacity: number
  text: string
}

type Geometry = {
  fadeStartX: number
  offLeft: number
  offRight: number
  particleZoneHeight: number
  particleZoneLeft: number
  particleZoneTop: number
  particleZoneWidth: number
  scanRest: number
  seamHeight: number
  seamTop: number
  seamX: number
}

type TimelinePhase = {
  elapsed: number
  name: PhaseName
  progress: number
}

type ScanFxState = {
  particlesActive: boolean
  particlesOpacity: number
  seamBloomOpacity: number
  seamCoreOpacity: number
}

const loopDurationMs = phaseTable.reduce((total, [, duration]) => total + duration, 0)

const unlockFrames = [
  { end: 90, mode: 'decrypting', opacity: displayOpacity.decrypting, text: '*7**#*?*' },
  { end: 180, mode: 'decrypting', opacity: displayOpacity.decrypting, text: '*A*9*I*' },
  { end: 290, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'A*7*1N' },
  { end: 400, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'AD**?N' },
  { end: 510, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'AD*1N' },
  { end: 610, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'ADM**' },
  { end: 680, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'ADM1*' },
  { end: phaseDuration.scanHold, mode: 'unlocked', opacity: displayOpacity.unlocked, text: unlockedDisplayCopy },
] as const

const relockFrames = [
  { end: 90, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'ADM1*' },
  { end: 180, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'ADM**' },
  { end: 290, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'AD*1N' },
  { end: 400, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'AD**?N' },
  { end: 510, mode: 'decrypting', opacity: displayOpacity.decrypting, text: 'A*7*1N' },
  { end: 610, mode: 'decrypting', opacity: displayOpacity.decrypting, text: '*A*9*I*' },
  { end: 700, mode: 'decrypting', opacity: displayOpacity.decrypting, text: '*7**#*?*' },
  { end: exitTiming.relockEnd, mode: 'locked', opacity: displayOpacity.locked, text: lockedDisplayCopy },
] as const

const entryEase = createBezierEasing(0.16, 0.84, 0.22, 1)
const exitEase = createBezierEasing(0.18, 0.5, 0.5, 1)
const fadeEase = createBezierEasing(0.18, 0.3, 0.5, 1)
const scanFxEase = createBezierEasing(0.18, 0.0, 0.28, 1)
const scanFxExitEase = createBezierEasing(0.14, 0.0, 0.08, 1)

const scanParticlesConfig = {
  autoPlay: false,
  background: { color: 'transparent' },
  clear: true,
  detectRetina: true,
  emitters: [
    {
      position: { x: 90, y: 120 },
      rate: { delay: 0.54, quantity: 1 },
      size: {
        height: scanParticleStyle.emitterNarrowHeightPercent,
        width: scanParticleStyle.emitterNarrowWidthPercent,
      },
    },
    {
      position: { x: 90, y: 120 },
      rate: { delay: 0.52, quantity: 1 },
      size: {
        height: scanParticleStyle.emitterWideHeightPercent,
        width: scanParticleStyle.emitterWideWidthPercent,
      },
    },
  ],
  fpsLimit: 60,
  fullScreen: { enable: false },
  pauseOnBlur: false,
  pauseOnOutsideViewport: false,
  particles: {
    color: {
      value: [...scanParticleStyle.palette],
    },
    life: {
      count: 1,
      duration: {
        sync: false,
        value: {
          max: scanParticleStyle.lifeDurationRangeSeconds[1],
          min: scanParticleStyle.lifeDurationRangeSeconds[0],
        },
      },
    },
    links: {
      enable: false,
    },
    move: {
      direction: 'top-left',
      enable: true,
      outModes: { default: 'destroy' },
      random: false,
      speed: {
        max: scanParticleStyle.speedRange[1],
        min: scanParticleStyle.speedRange[0],
      },
      straight: false,
    },
    number: {
      density: { enable: false },
      value: scanParticleStyle.count,
    },
    opacity: {
      animation: {
        destroy: 'min',
        enable: true,
        speed: 0.55,
        startValue: 'random',
        sync: false,
      },
      value: {
        max: scanParticleStyle.opacityRange[1],
        min: scanParticleStyle.opacityRange[0],
      },
    },
    shape: {
      type: 'circle',
    },
    size: {
      animation: {
        destroy: 'max',
        enable: true,
        speed: 0.7,
        startValue: 'random',
        sync: false,
      },
      value: {
        max: scanParticleStyle.sizeRange[1],
        min: scanParticleStyle.sizeRange[0],
      },
    },
  },
} satisfies ISourceOptions

let scanParticlesEnginePromise: Promise<void> | null = null

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function mix(start: number, end: number, progress: number) {
  return start + (end - start) * clamp01(progress)
}

function easedMix(start: number, end: number, progress: number, easing = scanFxEase) {
  return mix(start, end, easing(progress))
}

function rangedProgress(value: number, start: number, duration: number) {
  return clamp01((value - start) / duration)
}

function cubicBezierValue(a1: number, a2: number, value: number) {
  return ((1 - 3 * a2 + 3 * a1) * value + (3 * a2 - 6 * a1)) * value * value + 3 * a1 * value
}

function cubicBezierSlope(a1: number, a2: number, value: number) {
  return 3 * (1 - 3 * a2 + 3 * a1) * value * value + 2 * (3 * a2 - 6 * a1) * value + 3 * a1
}

function createBezierEasing(p1x: number, p1y: number, p2x: number, p2y: number) {
  return (value: number) => {
    const progress = clamp01(value)

    if (progress === 0 || progress === 1) {
      return progress
    }

    let sample = progress

    for (let index = 0; index < 5; index += 1) {
      const slope = cubicBezierSlope(p1x, p2x, sample)

      if (Math.abs(slope) < 0.001) {
        break
      }

      const currentX = cubicBezierValue(p1x, p2x, sample) - progress
      sample -= currentX / slope
    }

    return cubicBezierValue(p1y, p2y, clamp01(sample))
  }
}

function getPhase(loopMs: number): TimelinePhase {
  let remaining = loopMs

  for (const [name, duration] of phaseTable) {
    if (remaining < duration) {
      return {
        elapsed: remaining,
        name,
        progress: remaining / duration,
      }
    }

    remaining -= duration
  }

  return {
    elapsed: 0,
    name: 'idleLocked',
    progress: 0,
  }
}

function frameAt(
  elapsed: number,
  frames: ReadonlyArray<DisplayState & { end: number }>,
) {
  return frames.find((frame) => elapsed < frame.end) ?? frames[frames.length - 1]
}

function getDisplayState(phase: TimelinePhase): DisplayState {
  if (phase.name === 'scanHold') {
    return frameAt(phase.elapsed, unlockFrames)
  }

  if (phase.name === 'unlockResolved') {
    return {
      mode: 'unlocked',
      opacity: displayOpacity.unlocked,
      text: unlockedDisplayCopy,
    }
  }

  if (phase.name === 'exit' && phase.elapsed < exitTiming.relockEnd) {
    return frameAt(phase.elapsed, relockFrames)
  }

  return {
    mode: 'locked',
    opacity: displayOpacity.locked,
    text: lockedDisplayCopy,
  }
}

function getButtonVisualState(phase: TimelinePhase) {
  let progress = 0
  const activateStart = 812 + buttonTiming.onsetDelayAfterAdmin
  const activateCarry = phaseDuration.scanHold - activateStart

  if (phase.name === 'scanHold' && phase.elapsed >= activateStart) {
    progress = clamp01((phase.elapsed - activateStart) / buttonTiming.activateDuration)
  } else if (phase.name === 'unlockResolved') {
    progress = clamp01((phase.elapsed + activateCarry) / buttonTiming.activateDuration)
  } else if (phase.name === 'exit') {
    progress = 1 - clamp01(phase.elapsed / buttonTiming.dimDuration)
  }

  return {
    color: `rgb(${Math.round(mix(buttonState.inactiveColor[0], buttonState.activeColor[0], progress))}, ${Math.round(mix(buttonState.inactiveColor[1], buttonState.activeColor[1], progress))}, ${Math.round(mix(buttonState.inactiveColor[2], buttonState.activeColor[2], progress))})`,
    filter: `drop-shadow(0 0 ${mix(buttonState.inactiveGlowPx, buttonState.activeGlowPx, progress).toFixed(2)}px rgba(223, 230, 240, ${mix(buttonState.inactiveGlowAlpha, buttonState.activeGlowAlpha, progress).toFixed(3)}))`,
    opacity: mix(buttonState.inactiveOpacity, buttonState.activeOpacity, progress),
  }
}

function resolveGeometry(
  card: HTMLDivElement,
  reader: HTMLDivElement,
  track: HTMLDivElement,
): Geometry {
  const cardWidth = card.offsetWidth
  const cardHeight = card.offsetHeight
  const cardTop = track.offsetTop
  const cardCenterY = cardTop + cardHeight / 2
  const readerLeft = reader.offsetLeft
  const readerRight = readerLeft + reader.offsetWidth
  const scanRest =
    reader.offsetLeft -
    cardWidth * visibilityAnchors.scanRestVisibleLeft +
    visibilityAnchors.scanRestInsetPx
  const noLeftVisibleX = readerLeft
  const rightRevealX =
    readerRight - cardWidth * (1 - visibilityAnchors.rightRevealFadeThreshold)
  const boundaryGapX = track.offsetWidth - visibilityAnchors.fadeBoundaryGapPx - cardWidth
  const seamX = reader.offsetLeft - 1
  const particleZoneWidth = scanParticleStyle.zoneWidthPx
  const particleZoneHeight = cardHeight * scanParticleStyle.zoneHeightRatio
  const seamHeight = cardHeight * scanSeamStyle.bloomHeightMultiplier
  const seamTop = cardCenterY - seamHeight / 2

  return {
    fadeStartX: Math.max(noLeftVisibleX, rightRevealX, boundaryGapX),
    offLeft: -cardWidth - visibilityAnchors.offscreenGapPx,
    offRight: track.offsetWidth + visibilityAnchors.offscreenGapPx,
    particleZoneHeight,
    particleZoneLeft: seamX - particleZoneWidth + scanParticleStyle.emitterInsideReaderPx,
    particleZoneTop: cardTop + cardHeight * scanParticleStyle.zoneTopOffsetMultiplier,
    particleZoneWidth,
    scanRest,
    seamHeight,
    seamTop,
    seamX,
  }
}

function getScanFxState(phase: TimelinePhase): ScanFxState {
  if (phase.name === 'idleLocked' || phase.name === 'entry' || phase.name === 'reset') {
    return {
      particlesActive: false,
      particlesOpacity: 0,
      seamBloomOpacity: 0,
      seamCoreOpacity: 0,
    }
  }

  if (phase.name === 'scanHold') {
    const seamInProgress = rangedProgress(
      phase.elapsed,
      scanFxTiming.seamDelayMs,
      scanFxTiming.seamFadeInMs,
    )
    const particleInProgress = rangedProgress(
      phase.elapsed,
      scanFxTiming.particleDelayMs,
      scanFxTiming.particleFadeInMs,
    )
    const bloomInProgress = rangedProgress(
      phase.elapsed,
      scanFxTiming.seamDelayMs,
      scanFxTiming.seamFadeInMs + 90,
    )

    let seamCoreOpacity =
      phase.elapsed <= scanFxTiming.seamDelayMs
        ? 0
        : easedMix(0, scanSeamStyle.coreOpacity, seamInProgress)
    let seamBloomOpacity =
      phase.elapsed <= scanFxTiming.seamDelayMs
        ? 0
        : easedMix(0, scanSeamStyle.bloomOpacity, bloomInProgress)
    let particlesOpacity =
      phase.elapsed <= scanFxTiming.particleDelayMs
        ? 0
        : easedMix(0, 0.62, particleInProgress)

    if (phase.elapsed > scanFxTiming.peakStartMs) {
      const peakProgress = rangedProgress(
        phase.elapsed,
        scanFxTiming.peakStartMs,
        scanFxTiming.peakEndMs - scanFxTiming.peakStartMs,
      )
      seamCoreOpacity = easedMix(scanSeamStyle.coreOpacity, 0.9, peakProgress)
      seamBloomOpacity = easedMix(scanSeamStyle.bloomOpacity, 0.29, peakProgress)
      particlesOpacity = easedMix(0.62, 0.82, peakProgress)
    }

    if (phase.elapsed > scanFxTiming.peakEndMs) {
      const decayProgress = rangedProgress(
        phase.elapsed,
        scanFxTiming.peakEndMs,
        phaseDuration.scanHold - scanFxTiming.peakEndMs,
      )
      seamCoreOpacity = easedMix(0.9, 0.76, decayProgress)
      seamBloomOpacity = easedMix(0.29, 0.22, decayProgress)
      particlesOpacity = easedMix(0.82, 0.7, decayProgress)
    }

    const pulsePhase = phase.elapsed * 0.0125
    seamBloomOpacity += scanSeamStyle.pulseStrength * (0.5 + 0.5 * Math.sin(pulsePhase))

    return {
      particlesActive: particlesOpacity > 0.01,
      particlesOpacity,
      seamBloomOpacity,
      seamCoreOpacity,
    }
  }

  if (phase.name === 'unlockResolved') {
    const unlockFadeProgress = rangedProgress(
      phase.elapsed,
      scanFxTiming.unlockPeakHoldMs,
      phaseDuration.unlockResolved - scanFxTiming.unlockPeakHoldMs,
    )
    const seamCoreOpacity =
      phase.elapsed <= scanFxTiming.unlockPeakHoldMs
        ? 0.74
        : easedMix(0.74, 0.58, unlockFadeProgress)
    const seamBloomOpacity =
      phase.elapsed <= scanFxTiming.unlockPeakHoldMs
        ? 0.2
        : easedMix(0.2, 0.15, unlockFadeProgress)
    const particlesOpacity =
      phase.elapsed <= scanFxTiming.unlockPeakHoldMs
        ? 0.82
        : easedMix(0.82, 0.58, unlockFadeProgress)

    return {
      particlesActive: true,
      particlesOpacity,
      seamBloomOpacity,
      seamCoreOpacity,
    }
  }

  if (phase.name === 'exit') {
    const seamCoreOpacity =
      phase.elapsed >= scanFxTiming.exitSeamFadeMs
        ? 0
        : mix(
            0.58,
            0,
            scanFxExitEase(phase.elapsed / scanFxTiming.exitSeamFadeMs),
          )
    const seamBloomOpacity =
      phase.elapsed >= scanFxTiming.exitSeamFadeMs
        ? 0
        : mix(
            0.15,
            0,
            scanFxExitEase(phase.elapsed / scanFxTiming.exitSeamFadeMs),
          )

    let particlesOpacity = 0.58

    if (phase.elapsed > scanFxTiming.exitParticleHoldMs) {
      particlesOpacity = mix(
        0.58,
        0,
        scanFxEase(
          rangedProgress(
            phase.elapsed,
            scanFxTiming.exitParticleHoldMs,
            scanFxTiming.exitParticleFadeMs,
          ),
        ),
      )
    }

    if (phase.elapsed >= scanFxTiming.exitParticleHoldMs + scanFxTiming.exitParticleFadeMs) {
      particlesOpacity = 0
    }

    return {
      particlesActive:
        phase.elapsed < scanFxTiming.exitParticleHoldMs + scanFxTiming.exitParticleFadeMs,
      particlesOpacity,
      seamBloomOpacity,
      seamCoreOpacity,
    }
  }

  return {
    particlesActive: false,
    particlesOpacity: 0,
    seamBloomOpacity: 0,
    seamCoreOpacity: 0,
  }
}

function ensureScanParticlesEngine() {
  if (!scanParticlesEnginePromise) {
    scanParticlesEnginePromise = (async () => {
      await loadSlim(tsParticles, false)
      await loadEmittersPlugin(tsParticles, false)
    })()
  }

  return scanParticlesEnginePromise
}

function ReaderCircleIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="4.55" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function ReaderSquareIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3.9" y="3.9" width="8.2" height="8.2" rx="1.1" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function ReaderTriangleIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M8 4.05L12.05 11.15H3.95L8 4.05Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1"
      />
    </svg>
  )
}

function ReaderCrossIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4.7 4.7L11.3 11.3M11.3 4.7L4.7 11.3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
      />
    </svg>
  )
}

export default function Piece({ meta }: PieceComponentProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const cardTrackRef = useRef<HTMLDivElement | null>(null)
  const displayRef = useRef<HTMLParagraphElement | null>(null)
  const particlesHostRef = useRef<HTMLDivElement | null>(null)
  const seamRef = useRef<HTMLDivElement | null>(null)
  const buttonShapeRefs = useRef<Array<HTMLSpanElement | null>>([])
  const readerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const card = cardRef.current
    const cardTrack = cardTrackRef.current
    const display = displayRef.current
    const particlesHost = particlesHostRef.current
    const reader = readerRef.current
    const seam = seamRef.current
    const buttonShapes = buttonShapeRefs.current.filter(
      (shape): shape is HTMLSpanElement => shape !== null,
    )

    if (
      !card ||
      !cardTrack ||
      !display ||
      !particlesHost ||
      !reader ||
      !seam ||
      buttonShapes.length !== 4
    ) {
      return
    }

    let geometry = resolveGeometry(card, reader, cardTrack)
    let particlesContainer: TsParticlesContainer | null = null
    let particlesPlaying = false
    let cancelled = false
    let latestLoopMs = 0

    const syncParticlesPlayback = (shouldPlay: boolean) => {
      if (!particlesContainer || particlesPlaying === shouldPlay) {
        return
      }

      if (shouldPlay) {
        particlesContainer.play()
      } else {
        particlesContainer.pause()
        particlesContainer.refresh()
      }

      particlesPlaying = shouldPlay
    }

    const applyFxGeometry = () => {
      seam.style.left = `${(geometry.seamX - scanSeamStyle.hostWidthPx).toFixed(2)}px`
      seam.style.top = `${geometry.seamTop.toFixed(2)}px`
      seam.style.height = `${geometry.seamHeight.toFixed(2)}px`
      particlesHost.style.left = `${geometry.particleZoneLeft.toFixed(2)}px`
      particlesHost.style.top = `${geometry.particleZoneTop.toFixed(2)}px`
      particlesHost.style.width = `${geometry.particleZoneWidth.toFixed(2)}px`
      particlesHost.style.height = `${geometry.particleZoneHeight.toFixed(2)}px`
      particlesContainer?.canvas.resize()
    }

    const applyStaticState = () => {
      const phase = getPhase(0)
      const buttonVisualState = getButtonVisualState(phase)

      card.style.opacity = '1'
      card.style.transform = `translate3d(${geometry.scanRest.toFixed(2)}px, 0, 0)`
      display.style.opacity = displayOpacity.locked.toFixed(3)
      display.textContent = lockedDisplayCopy
      display.dataset.mode = 'locked'
      seam.style.setProperty('--scan-seam-core-opacity', '0')
      seam.style.setProperty('--scan-seam-bloom-opacity', '0')
      particlesHost.style.opacity = '0'
      syncParticlesPlayback(false)

      for (const buttonShape of buttonShapes) {
        buttonShape.style.color = buttonVisualState.color
        buttonShape.style.filter = buttonVisualState.filter
        buttonShape.style.opacity = buttonVisualState.opacity.toFixed(3)
      }
    }

    const applyVisualState = (loopMs: number) => {
      const phase = getPhase(loopMs)
      const displayState = getDisplayState(phase)
      const buttonVisualState = getButtonVisualState(phase)
      const scanFxState = getScanFxState(phase)

      let cardOpacity = 1
      let cardX = geometry.scanRest

      if (phase.name === 'idleLocked') {
        cardOpacity = 0
        cardX = geometry.offLeft
      } else if (phase.name === 'entry') {
        const motionProgress = clamp01(phase.progress / entryTiming.motionEndProgress)
        cardX = mix(geometry.offLeft, geometry.scanRest, entryEase(motionProgress))
      } else if (phase.name === 'exit') {
        cardX = mix(geometry.scanRest, geometry.offRight, exitEase(phase.progress))

        if (phase.elapsed >= exitTiming.fadeMinElapsed && cardX >= geometry.fadeStartX) {
          cardOpacity = mix(
            1,
            0,
            fadeEase(
              (cardX - geometry.fadeStartX) /
                (geometry.offRight - geometry.fadeStartX),
            ),
          )
        }
      } else if (phase.name === 'reset') {
        cardOpacity = 0
        cardX = geometry.offLeft
      }

      card.style.opacity = cardOpacity.toFixed(3)
      card.style.transform = `translate3d(${cardX.toFixed(2)}px, 0, 0)`
      display.style.opacity = displayState.opacity.toFixed(3)
      display.textContent = displayState.text
      display.dataset.mode = displayState.mode
      seam.style.setProperty('--scan-seam-core-opacity', scanFxState.seamCoreOpacity.toFixed(3))
      seam.style.setProperty('--scan-seam-bloom-opacity', scanFxState.seamBloomOpacity.toFixed(3))
      particlesHost.style.opacity = scanFxState.particlesOpacity.toFixed(3)
      syncParticlesPlayback(scanFxState.particlesActive)

      for (const buttonShape of buttonShapes) {
        buttonShape.style.color = buttonVisualState.color
        buttonShape.style.filter = buttonVisualState.filter
        buttonShape.style.opacity = buttonVisualState.opacity.toFixed(3)
      }
    }

    const updateGeometry = () => {
      geometry = resolveGeometry(card, reader, cardTrack)
      applyFxGeometry()

      if (prefersReducedMotion) {
        applyStaticState()
      } else {
        applyVisualState(latestLoopMs)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateGeometry()
    })

    resizeObserver.observe(card)
    resizeObserver.observe(cardTrack)
    resizeObserver.observe(reader)

    if (prefersReducedMotion) {
      applyFxGeometry()
      applyStaticState()

      return () => {
        resizeObserver.disconnect()
      }
    }

    let frameId = 0
    const startedAt = performance.now()

    const tick = (now: number) => {
      const loopMs = (now - startedAt) % loopDurationMs
      latestLoopMs = loopMs
      applyVisualState(loopMs)
      frameId = window.requestAnimationFrame(tick)
    }

    applyFxGeometry()
    applyVisualState(0)
    frameId = window.requestAnimationFrame(tick)

    void (async () => {
      await ensureScanParticlesEngine()

      if (cancelled) {
        return
      }

      const loadedParticlesContainer = await tsParticles.load({
        element: particlesHost,
        id: 'access-card-scan-particles',
        options: scanParticlesConfig,
      })

      if (!loadedParticlesContainer) {
        return
      }

      particlesContainer = loadedParticlesContainer

      if (cancelled) {
        particlesContainer.destroy()
        particlesContainer = null
        return
      }

      particlesContainer.pause()
      particlesPlaying = false
      applyFxGeometry()
      applyVisualState(latestLoopMs)
    })()

    return () => {
      cancelled = true
      resizeObserver.disconnect()
      window.cancelAnimationFrame(frameId)
      particlesContainer?.destroy()
    }
  }, [prefersReducedMotion])

  return (
    <section className="project-three-rbac-piece" aria-label={meta.title}>
      <article
        className="security-card"
        data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      >
        <div className="security-card-animation" aria-hidden="true">
          <div className="security-rbac">
            <div ref={cardTrackRef} className="security-rbac__card-track">
              <div ref={cardRef} className="security-rbac__card" aria-hidden="true">
                <div className="security-rbac__card-sheen" />
                <div className="security-rbac__card-slot" />
              </div>
            </div>

            <div ref={particlesHostRef} className="security-rbac__scan-particles" aria-hidden="true" />

            <div ref={seamRef} className="security-rbac__scan-seam" aria-hidden="true" />

            <div ref={readerRef} className="security-rbac__reader" aria-hidden="true">
              <div className="security-rbac__reader-shell">
                <div className="security-rbac__screen-shell">
                  <div className="security-rbac__screen-viewport">
                    <p ref={displayRef} className="security-rbac__display" aria-hidden="true">
                      {lockedDisplayCopy}
                    </p>
                  </div>
                </div>

                <div className="security-rbac__buttons" aria-hidden="true">
                  {[
                    ReaderCircleIcon,
                    ReaderSquareIcon,
                    ReaderTriangleIcon,
                    ReaderCrossIcon,
                  ].map((Icon, index) => (
                    <div key={index} className="security-rbac__button">
                      <div className="security-rbac__button-well" />
                      <span
                        ref={(node: HTMLSpanElement | null) => {
                          buttonShapeRefs.current[index] = node
                        }}
                        className="security-rbac__button-shape"
                      >
                        <Icon />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="security-card-label">Role-Based Access Control</div>
      </article>
    </section>
  )
}
