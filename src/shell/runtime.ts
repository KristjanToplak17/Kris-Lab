import type { WindowRect } from '../lib/windowing'

export type LauncherView = 'root' | 'projects'
export type ShellAppKind = 'launcher' | 'about' | 'project'
export type ShellWindowKind = 'launcher' | 'about' | 'project'

export interface ShellAppRecord {
  id: string
  kind: ShellAppKind
  label: string
  windowId: string
}

export interface LauncherAppRecord extends ShellAppRecord {
  kind: 'launcher'
}

export interface AboutAppRecord extends ShellAppRecord {
  kind: 'about'
}

export interface ProjectAppRecord extends ShellAppRecord {
  kind: 'project'
  projectSlug: string
}

export interface ShellWindowRecord {
  id: string
  appId: string
  kind: ShellWindowKind
  rect: WindowRect
  minWidth: number
  minHeight: number
}

export const launcherAppId = 'app:launcher'
export const launcherWindowId = 'window:launcher'
export const aboutAppId = 'app:about'
export const aboutWindowId = 'window:about'

export function createProjectAppId(slug: string): string {
  return `app:project:${slug}`
}

export function createProjectWindowId(slug: string): string {
  return `window:project:${slug}`
}
