import { useEffect } from 'react'
import { useMatch } from 'react-router-dom'
import { getApprovedPieces, getPieceBySlug } from '../pieces/registry'
import { ShellLayout } from './ShellLayout'

export function ShellRoute() {
  const projectMatch = useMatch('/piece/:slug')
  const slug = projectMatch?.params.slug
  const activeProject = slug ? getPieceBySlug(slug) ?? null : null
  const missingProjectSlug = slug && !activeProject ? slug : null

  useEffect(() => {
    document.title = activeProject
      ? `${activeProject.title} - Kris' Lab`
      : missingProjectSlug
        ? `Experiment unavailable - Kris' Lab`
        : "Kris' Lab"
  }, [activeProject, missingProjectSlug])

  return (
    <ShellLayout
      pieces={getApprovedPieces()}
      activeProject={activeProject}
      missingProjectSlug={missingProjectSlug}
    />
  )
}
