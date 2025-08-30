"use client"

import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: true,
      duration: 1.1,
      easing: (x: number) => 1 - Math.pow(1 - x, 3),
    })

    let raf = 0
    const rafFn = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(rafFn)
    }
    raf = requestAnimationFrame(rafFn)

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) lenis.stop()

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])

  return null
}
