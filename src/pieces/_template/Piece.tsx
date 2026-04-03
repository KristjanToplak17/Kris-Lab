import type { PieceComponentProps } from '../types'
import './piece.css'

export default function Piece({ meta }: PieceComponentProps) {
  return (
    <section className="piece-template">
      <div className="piece-template__card">
        <p className="piece-template__eyebrow">Template / {meta.status}</p>
        <h2>{meta.title}</h2>
        <p>
          Duplicate this folder, rename the classes, replace the poster, and keep
          all styling local to the experiment.
        </p>
      </div>
    </section>
  )
}
