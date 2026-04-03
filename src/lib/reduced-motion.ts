import { useEffect, useState } from 'react'

const query = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)

    return () => {
      mediaQuery.removeEventListener('change', updateMotionPreference)
    }
  }, [])

  return prefersReducedMotion
}
