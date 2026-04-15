import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../lib/reduced-motion'
import type { PublicProjectEntry } from '../pieces/types'
import { tripToMaltaImages } from '../pieces/trip-to-malta/assets'
import './trip-to-malta-folder.css'

interface TripToMaltaFolderProps {
  piece: PublicProjectEntry
  onOpenProject?: (project: PublicProjectEntry) => void
  showCopy?: boolean
  className?: string
}

const folderVariants = {
  closed: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { type: 'spring', stiffness: 200, damping: 20, mass: 1 },
  },
  open: {
    scale: 1.1,
    transition: { type: 'spring', stiffness: 150, damping: 18, mass: 1 },
  },
} as const

const flapVariants = {
  closed: {
    rotateX: -20,
    transition: { type: 'spring', stiffness: 60, damping: 20 },
  },
  hover: {
    rotateX: -30,
    transition: { type: 'spring', stiffness: 100, damping: 18, mass: 1 },
  },
  open: {
    rotateX: -60,
    transition: { type: 'spring', stiffness: 90, damping: 18, mass: 1 },
  },
} as const

const cardVariants = [
  {
    closed: {
      y: -50,
      x: 0,
      rotate: 2,
      scale: 0.95,
      z: 0,
      transition: { type: 'spring', stiffness: 150, damping: 25, mass: 1 },
    },
    hover: {
      y: -80,
      x: 0,
      rotate: 4,
      scale: 0.95,
      z: 0,
      transition: { type: 'spring', stiffness: 140, damping: 18, mass: 1 },
    },
    open: {
      x: -120,
      y: -150,
      rotate: -8,
      scale: 0.9,
      z: 200,
      transition: { type: 'spring', stiffness: 80, damping: 14, mass: 1, delay: 0.16 },
    },
  },
  {
    closed: {
      y: -45,
      x: 0,
      rotate: 0,
      scale: 0.95,
      z: 5,
      transition: { type: 'spring', stiffness: 150, damping: 25, mass: 1 },
    },
    hover: {
      y: -75,
      x: 0,
      rotate: 0,
      scale: 0.95,
      z: 5,
      transition: { type: 'spring', stiffness: 140, damping: 18, mass: 1 },
    },
    open: {
      x: 0,
      y: -160,
      rotate: 0,
      scale: 0.9,
      z: 205,
      transition: { type: 'spring', stiffness: 80, damping: 14, mass: 1, delay: 0.08 },
    },
  },
  {
    closed: {
      y: -40,
      x: 0,
      rotate: -2,
      scale: 0.95,
      z: 10,
      transition: { type: 'spring', stiffness: 150, damping: 25, mass: 1 },
    },
    hover: {
      y: -70,
      x: 0,
      rotate: -4,
      scale: 0.95,
      z: 10,
      transition: { type: 'spring', stiffness: 140, damping: 18, mass: 1 },
    },
    open: {
      x: 120,
      y: -150,
      rotate: 8,
      scale: 0.9,
      z: 210,
      transition: { type: 'spring', stiffness: 80, damping: 14, mass: 1, delay: 0 },
    },
  },
] as const

function getReducedCardStyle(index: number, isOpen: boolean) {
  if (!isOpen) {
    return {
      transform: `translate3d(0, ${-50 + index * 5}px, 0) scale(0.95) rotate(${2 - index * 2}deg)`,
    }
  }

  if (index === 0) {
    return { transform: 'translate3d(-120px, -150px, 0) scale(0.9) rotate(-8deg)' }
  }

  if (index === 1) {
    return { transform: 'translate3d(0, -160px, 0) scale(0.9) rotate(0deg)' }
  }

  return { transform: 'translate3d(120px, -150px, 0) scale(0.9) rotate(8deg)' }
}

export function TripToMaltaFolder({
  piece,
  onOpenProject,
  showCopy = true,
  className,
}: TripToMaltaFolderProps) {
  const reducedMotion = usePrefersReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const flapRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [useFlapBlurFallback, setUseFlapBlurFallback] = useState(false)
  const shouldUseFlapBlurFallback = !reducedMotion && useFlapBlurFallback

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleOutsidePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsidePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsidePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (reducedMotion) {
      return undefined
    }

    let frameOne = 0
    let frameTwo = 0

    const checkBackdropFilter = () => {
      const flap = flapRef.current

      if (!flap) {
        return
      }

      const computedBackdropFilter = getComputedStyle(flap).backdropFilter
      setUseFlapBlurFallback(!computedBackdropFilter || computedBackdropFilter === 'none')
    }

    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(checkBackdropFilter)
    })

    return () => {
      window.cancelAnimationFrame(frameOne)
      window.cancelAnimationFrame(frameTwo)
    }
  }, [reducedMotion])

  const animationState = isOpen ? 'open' : isHovered && !reducedMotion ? 'hover' : 'closed'

  return (
    <div
      className={[
        'projects-folder-showcase',
        showCopy ? '' : 'projects-folder-showcase--piece',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showCopy ? (
        <div className="projects-folder-showcase__copy">
          <p className="projects-folder-showcase__eyebrow">Projects / 01</p>
          <h2>{piece.title}</h2>
          <p>
            A direct remake of the folder interaction language from the reference, adapted to Malta images and the existing launcher shell.
          </p>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="projects-folder"
        data-open={isOpen}
        onMouseEnter={() => {
          setIsHovered(true)
          void piece.importer()
        }}
        onMouseLeave={() => {
          setIsHovered(false)
        }}
      >
        <div className="projects-folder__shadow" aria-hidden="true" />

        <motion.div
          className="projects-folder__body"
          variants={reducedMotion ? undefined : folderVariants}
          initial={false}
          animate={reducedMotion ? undefined : animationState}
          role="button"
          tabIndex={0}
          aria-label={isOpen ? `Close ${piece.title} folder` : `Open ${piece.title} folder`}
          aria-pressed={isOpen}
          onClick={() => {
            setIsOpen((current) => !current)
            void piece.importer()
          }}
          onFocus={() => {
            void piece.importer()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setIsOpen((current) => !current)
              void piece.importer()
            }

            if (event.key === 'Escape') {
              event.preventDefault()
              setIsOpen(false)
            }
          }}
          style={reducedMotion ? undefined : { transformStyle: 'preserve-3d' }}
        >
          <div className="projects-folder__shell" aria-hidden="true">
            <div className="projects-folder__shell-grain" />
            <div className="projects-folder__shell-shade" />
          </div>

          <div className="projects-folder__cards">
            {tripToMaltaImages.map((image, index) => {
              const cardMotion = reducedMotion
                ? undefined
                : {
                    variants: cardVariants[index],
                    initial: false,
                    animate: animationState,
                  }

              return (
                <motion.button
                  key={image.id}
                  type="button"
                  className="projects-folder__card"
                  style={reducedMotion ? getReducedCardStyle(index, isOpen) : { zIndex: 3 + index }}
                  {...cardMotion}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={(event) => {
                    event.stopPropagation()
                    if (onOpenProject) {
                      setIsOpen(false)
                      onOpenProject(piece)
                    }
                  }}
                  onFocus={() => {
                    void piece.importer()
                  }}
                >
                  <img className="projects-folder__card-image" src={image.src} alt={image.alt} />
                  <span className="projects-folder__card-grain" />
                  <span className="projects-folder__card-sheen" />
                </motion.button>
              )
            })}
          </div>

          <motion.div
            className="projects-folder__flap-wrap"
            variants={reducedMotion ? undefined : flapVariants}
            initial={false}
            animate={reducedMotion ? undefined : animationState}
            style={reducedMotion ? undefined : { transformStyle: 'preserve-3d', transformOrigin: 'bottom' }}
          >
            <div
              ref={flapRef}
              className="projects-folder__flap"
              aria-hidden="true"
              style={
                reducedMotion
                  ? undefined
                  : {
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                    }
              }
            >
              {shouldUseFlapBlurFallback ? (
                <div className="projects-folder__flap-fallback" aria-hidden="true">
                  <div className="projects-folder__flap-fallback-stack">
                    <motion.div
                      className="projects-folder__flap-fallback-card"
                      variants={reducedMotion ? undefined : cardVariants[2]}
                      initial={false}
                      animate={reducedMotion ? undefined : animationState}
                      style={reducedMotion ? getReducedCardStyle(2, isOpen) : undefined}
                    >
                      <img
                        className="projects-folder__flap-fallback-image"
                        src={tripToMaltaImages[2].src}
                        alt=""
                      />
                    </motion.div>
                  </div>
                </div>
              ) : null}
              <div className="projects-folder__flap-sheen" />
              <div className="projects-folder__flap-grain" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
