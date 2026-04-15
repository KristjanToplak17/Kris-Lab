export const shellEase = [0.23, 1, 0.32, 1] as const

export function getPageReveal(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.14 },
    }
  }

  return {
    initial: { opacity: 0, y: 14, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.46, ease: shellEase },
  }
}
