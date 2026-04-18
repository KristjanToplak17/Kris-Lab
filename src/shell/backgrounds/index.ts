import frostVeilPreviewUrl from './assets/previews/background3-preview.jpg'
import liquidHorizonPreviewUrl from './assets/previews/background2-preview.jpg'
import opalineMistPreviewUrl from './assets/previews/background1-preview.jpg'
import frostVeilUrl from './assets/background3.jpg'
import liquidHorizonUrl from './assets/background2.jpg'
import opalineMistUrl from './assets/background1.jpg'

export type ShellBackgroundId = 'animated' | 'opaline-mist' | 'liquid-horizon' | 'frost-veil'
export type ShellBackgroundKind = 'animated' | 'static'

export interface ShellBackgroundDefinition {
  id: ShellBackgroundId
  kind: ShellBackgroundKind
  label: string
  previewSrc: string | null
  desktopSrc: string | null
}

export const shellBackgroundOptions: ShellBackgroundDefinition[] = [
  {
    id: 'animated',
    kind: 'animated',
    label: 'Animated',
    previewSrc: null,
    desktopSrc: null,
  },
  {
    id: 'opaline-mist',
    kind: 'static',
    label: 'Opaline Mist',
    previewSrc: opalineMistPreviewUrl,
    desktopSrc: opalineMistUrl,
  },
  {
    id: 'liquid-horizon',
    kind: 'static',
    label: 'Liquid Horizon',
    previewSrc: liquidHorizonPreviewUrl,
    desktopSrc: liquidHorizonUrl,
  },
  {
    id: 'frost-veil',
    kind: 'static',
    label: 'Frost Veil',
    previewSrc: frostVeilPreviewUrl,
    desktopSrc: frostVeilUrl,
  },
]

export function isShellBackgroundId(value: string): value is ShellBackgroundId {
  return shellBackgroundOptions.some((option) => option.id === value)
}
