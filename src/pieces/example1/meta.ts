import poster from './assets/poster.svg'
import type { PieceManifest } from '../types'

export const meta = {
  slug: 'example1',
  title: 'Quiet Current',
  description: 'A framed motion study that lets layered bands drift across a measured field.',
  status: 'exploration',
  mode: 'hosted',
  order: 1,
  poster,
} satisfies PieceManifest
