import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicProjectBySlug, getPublicProjects } from '../pieces/registry'
import { ShellLayout } from './ShellLayout'

export function ShellRoute() {
  const { slug } = useParams<{ slug?: string }>()
  const activeProject = slug ? getPublicProjectBySlug(slug) ?? null : null
  const missingProjectSlug = slug && !activeProject ? slug : null

  useEffect(() => {
    document.title = activeProject
      ? `${activeProject.title} - Kris' Lab`
      : missingProjectSlug
        ? `Project unavailable - Kris' Lab`
        : "Kris' Lab"
  }, [activeProject, missingProjectSlug])

  return (
    <ShellLayout
      pieces={getPublicProjects()}
      activeProject={activeProject}
      missingProjectSlug={missingProjectSlug}
    />
  )
}
