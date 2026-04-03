import { lazy } from 'react'
import type { LazyPieceComponent, PieceImporter, PieceManifest, PieceMeta } from './types'
import { meta as example1Meta } from './example1/meta'

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
