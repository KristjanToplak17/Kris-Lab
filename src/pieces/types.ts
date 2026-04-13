import type { ComponentType, LazyExoticComponent } from 'react'

export type PieceStatus = 'exploration' | 'candidate' | 'approved' | 'archived'

export type PieceMode = 'hosted' | 'isolated'

export interface PieceManifest {
  slug: string
  title: string
  description: string
  status: PieceStatus
  mode: PieceMode
  order: number
}

export interface PieceComponentProps {
  meta: PieceMeta
}

export type PieceImporter = () => Promise<{
  default: ComponentType<PieceComponentProps>
}>

export interface PieceMeta extends PieceManifest {
  importer: PieceImporter
}

export type PublicProjectEntry = Pick<
  PieceMeta,
  'slug' | 'title' | 'description' | 'order' | 'importer'
>

export type LazyPieceComponent = LazyExoticComponent<ComponentType<PieceComponentProps>>
