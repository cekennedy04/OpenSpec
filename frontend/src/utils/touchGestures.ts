import { useRef } from 'react'

export interface TouchOptions {
  minDistance?: number
  maxDuration?: number
  onTap?: () => void
  onLongPress?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  distanceX: number
  distanceY: number
}

export function useTouchGestures(options: TouchOptions) {
  const stateRef = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    distanceX: 0,
    distanceY: 0,
  })

  const minDistance = options.minDistance || 50
  const maxDuration = options.maxDuration || 500
  const longPressDuration = 1000

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      distanceX: 0,
      distanceY: 0,
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!e.touches[0]) return
    const touch = e.touches[0]
    stateRef.current.distanceX = touch.clientX - stateRef.current.startX
    stateRef.current.distanceY = touch.clientY - stateRef.current.startY
  }

  const handleTouchEnd = () => {
    const state = stateRef.current
    const duration = Date.now() - state.startTime
    const distance = Math.sqrt(state.distanceX ** 2 + state.distanceY ** 2)

    // Long press
    if (duration > longPressDuration && distance < minDistance) {
      options.onLongPress?.()
      return
    }

    // Tap
    if (distance < minDistance && duration < maxDuration) {
      options.onTap?.()
      return
    }

    // Swipe detection
    if (distance > minDistance) {
      const isHorizontal = Math.abs(state.distanceX) > Math.abs(state.distanceY)

      if (isHorizontal) {
        if (state.distanceX > minDistance) {
          options.onSwipeRight?.()
        } else if (state.distanceX < -minDistance) {
          options.onSwipeLeft?.()
        }
      } else {
        if (state.distanceY > minDistance) {
          options.onSwipeDown?.()
        } else if (state.distanceY < -minDistance) {
          options.onSwipeUp?.()
        }
      }
    }
  }

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}
