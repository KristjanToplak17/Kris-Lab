import type { NavigateFunction } from 'react-router-dom'

export interface LabNavigationState {
  fromLab?: boolean
}

export function createLabNavigationState(): LabNavigationState {
  return { fromLab: true }
}

export function getPiecePath(slug: string): string {
  return `/piece/${slug}`
}

export function navigateToShell(
  navigate: NavigateFunction,
  state?: LabNavigationState | null,
): void {
  if (state?.fromLab) {
    navigate(-1)
    return
  }

  navigate('/')
}
