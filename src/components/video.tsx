"use client"

import { useEffect, useRef } from "react"

export const Video = ({ src, ...props }: React.VideoHTMLAttributes<HTMLVideoElement>) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return
        }

        if (entry.isIntersecting) {
          if (!el.src) {
            el.src = src as string
            el.load()
          }
          el.play().catch(() => {
            // Ignore autoplay rejection
          })
        } else {
          el.pause()
          el.currentTime = 0
        }
      },
      { rootMargin: "200px", threshold: 0.1 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [src])

  return (
    <video
      ref={ref}
      playsInline
      muted
      preload="auto"
      style={{ borderRadius: "8px", width: "100%" }}
      {...props}
    >
      <track kind="captions" />
    </video>
  )
}
