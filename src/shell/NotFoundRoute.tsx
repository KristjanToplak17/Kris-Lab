import { Link } from 'react-router-dom'
import './shell.css'

interface ShellNotFoundStateProps {
  missingProjectSlug?: string | null
  onReturn?: () => void
}

export function ShellNotFoundState({
  missingProjectSlug = null,
  onReturn,
}: ShellNotFoundStateProps) {
  const requestedPath = missingProjectSlug ? `/project/${missingProjectSlug}` : null

  return (
    <div className="shell-not-found shell-not-found--embedded">
      <div className="shell-not-found__card">
        <p className="shell-not-found__eyebrow">
          {missingProjectSlug ? 'Project unavailable' : 'Not found'}
        </p>
        <h1>
          {missingProjectSlug
            ? 'This project is not part of the lab.'
            : 'This route is not part of the lab.'}
        </h1>
        <p>
          The shell only exposes public projects, and this path does not map to a
          registered project.
        </p>
        {requestedPath ? (
          <p className="shell-not-found__meta">
            Requested path{' '}
            <span className="shell-not-found__slug">{requestedPath}</span>
          </p>
        ) : null}
        {onReturn ? (
          <button
            type="button"
            className="shell-not-found__link"
            onClick={onReturn}
          >
            View projects
          </button>
        ) : (
          <Link className="shell-not-found__link" to="/">
            Return to Kris&apos; Lab
          </Link>
        )}
      </div>
    </div>
  )
}

export function NotFoundRoute() {
  return (
    <main className="shell-not-found shell-not-found--route">
      <ShellNotFoundState />
    </main>
  )
}
