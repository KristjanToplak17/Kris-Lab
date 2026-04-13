import type { PieceComponentProps } from '../types'
import { TripToMaltaFolder } from '../../shell/TripToMaltaFolder'
import './piece.css'

export default function Piece({ meta }: PieceComponentProps) {
  return (
    <section className="trip-to-malta-piece" aria-label={meta.title}>
      <TripToMaltaFolder
        piece={{
          slug: meta.slug,
          title: meta.title,
          description: meta.description,
          order: meta.order,
          importer: meta.importer,
        }}
        showCopy={false}
      />
    </section>
  )
}
