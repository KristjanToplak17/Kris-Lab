import { useEffect, useState } from 'react'

type CleanupFn = () => void

export interface CleanupBag {
  add: (cleanup: CleanupFn) => void
  flush: () => void
}

export function createCleanupBag(): CleanupBag {
  const cleanups = new Set<CleanupFn>()

  return {
    add(cleanup) {
      cleanups.add(cleanup)
    },
    flush() {
      for (const cleanup of Array.from(cleanups).reverse()) {
        cleanup()
      }

      cleanups.clear()
    },
  }
}

export function useCleanupBag(): CleanupBag {
  const [bag] = useState(createCleanupBag)

  useEffect(() => {
    return () => {
      bag.flush()
    }
  }, [bag])

  return bag
}
