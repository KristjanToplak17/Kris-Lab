import poster from './assets/poster.svg'
import type { PieceManifest } from '../types'

export const meta = {
  slug: 'template-piece',
  title: 'Template Piece',
  description: 'Starting point for a new experiment.',
  status: 'exploration',
  mode: 'hosted',
  order: 999,
  poster,
} satisfies PieceManifest
