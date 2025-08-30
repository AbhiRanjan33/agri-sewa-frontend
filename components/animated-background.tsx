"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

export default function AnimatedBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -20])

  return (
    <div ref={ref} className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 animate-gradient" />
      <motion.div style={{ y: y1 }} aria-hidden className="absolute left-0 right-0 top-10 flex justify-between px-10">
        <div className="h-20 w-40 md:w-56 bg-white/60 rounded-full blur-md animate-clouds" />
        <div className="h-16 w-32 md:w-44 bg-white/50 rounded-full blur-md animate-clouds" />
      </motion.div>
      <motion.div style={{ y: y2 }} aria-hidden className="absolute left-0 right-0 top-32 flex justify-around px-6">
        <div className="h-14 w-28 bg-white/50 rounded-full blur-md animate-clouds" />
        <div className="h-10 w-20 bg-white/40 rounded-full blur-md animate-clouds" />
        <div className="h-14 w-28 bg-white/50 rounded-full blur-md animate-clouds" />
      </motion.div>
    </div>
  )
}
