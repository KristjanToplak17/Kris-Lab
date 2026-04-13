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
      ? `${activeProject.title} - Kris's OS`
      : missingProjectSlug
        ? `Project unavailable - Kris's OS`
        : "Kris's OS"
  }, [activeProject, missingProjectSlug])

  return (
    <ShellLayout
      pieces={getPublicProjects()}
      activeProject={activeProject}
      missingProjectSlug={missingProjectSlug}
    />
  )
}
