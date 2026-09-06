'use client'

import { useEffect, useRef } from 'react'

export function useOnMount(effect: () => void): void {
  const firedRef = useRef(false)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    effect()
  }, [effect])
}
