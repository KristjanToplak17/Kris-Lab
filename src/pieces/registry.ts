import { lazy } from 'react'
import type {
  LazyPieceComponent,
  PieceImporter,
  PieceManifest,
  PieceMeta,
  PublicProjectEntry,
} from './types'
import { meta as example1Meta } from './example1/meta'

const blockedPublicSlugSegments = ['placeholder', 'tbd', 'template', 'todo', 'wip'] as const

const blockedPublicTextMarkers = [
  'coming soon',
  'placeholder',
  'starting point',
  'tbd',
  'template',
  'todo',
  'work in progress',
  'wip',
] as const

function definePiece(manifest: PieceManifest, importer: PieceImporter): PieceMeta {
  return {
    ...manifest,
    importer,
  }
}

export const pieceRegistry: PieceMeta[] = [
  definePiece(example1Meta, () => import('./example1/Piece')),
].sort((left, right) => left.order - right.order)

export const lazyPieceComponents = Object.fromEntries(
  pieceRegistry.map((piece) => [piece.slug, lazy(piece.importer)]),
) as Record<string, LazyPieceComponent>

export function getApprovedPieces(): PieceMeta[] {
  return pieceRegistry.filter((piece) => piece.status === 'approved')
}

export function getPieceBySlug(slug: string): PieceMeta | undefined {
  return pieceRegistry.find((piece) => piece.slug === slug)
}

function normalizePublicProjectText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function hasPublicProjectText(value: string): boolean {
  const normalizedValue = normalizePublicProjectText(value)

  if (normalizedValue.length === 0) {
    return false
  }

  return true
}

function hasBlockedPublicTextMarker(value: string): boolean {
  const normalizedValue = normalizePublicProjectText(value)

  if (normalizedValue.length === 0) {
    return false
  }

  return blockedPublicTextMarkers.some((marker) => normalizedValue.includes(marker))
}

function hasBlockedPublicSlugSegment(value: string): boolean {
  const normalizedValue = normalizePublicProjectText(value)

  if (normalizedValue.length === 0) {
    return false
  }

  const slugSegments = normalizedValue.split(/[^a-z0-9]+/).filter(Boolean)

  return slugSegments.some((segment) =>
    blockedPublicSlugSegments.includes(segment as (typeof blockedPublicSlugSegments)[number]),
  )
}

function isPublicProjectReady(piece: PieceMeta): boolean {
  return (
    hasPublicProjectText(piece.slug) &&
    hasPublicProjectText(piece.title) &&
    hasPublicProjectText(piece.description) &&
    !hasBlockedPublicSlugSegment(piece.slug) &&
    !hasBlockedPublicTextMarker(piece.title) &&
    !hasBlockedPublicTextMarker(piece.description)
  )
}

function isPublicProjectEligible(piece: PieceMeta): piece is PieceMeta & PublicProjectEntry {
  return (
    piece.status === 'approved' &&
    piece.mode === 'hosted' &&
    isPublicProjectReady(piece)
  )
}

function toPublicProjectEntry(piece: PieceMeta): PublicProjectEntry {
  const { description, importer, order, slug, title } = piece

  return {
    description,
    importer,
    order,
    slug,
    title,
  }
}

export function getPublicProjects(): PublicProjectEntry[] {
  return pieceRegistry.filter(isPublicProjectEligible).map(toPublicProjectEntry)
}

export function getPublicProjectBySlug(slug: string): PublicProjectEntry | undefined {
  const piece = getPieceBySlug(slug)

  if (!piece || !isPublicProjectEligible(piece)) {
    return undefined
  }

  return toPublicProjectEntry(piece)
}
