import type { NavigateFunction } from 'react-router-dom'

export interface LabNavigationState {
  fromLab?: boolean
}

export function getProjectPath(slug: string): string {
  return `/project/${slug}`
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
