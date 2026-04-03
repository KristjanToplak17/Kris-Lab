import type { PieceComponentProps } from '../types'
import './piece.css'

export default function Piece({ meta }: PieceComponentProps) {
  return <section className="quiet-current-placeholder" aria-label={`${meta.title} placeholder stage`} />
}
