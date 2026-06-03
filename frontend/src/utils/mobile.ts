export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export const getViewportHeight = (): number => {
  return Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  )
}

export const getViewportWidth = (): number => {
  return Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  )
}

export const addViewportMeta = () => {
  let viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.setAttribute('name', 'viewport')
    document.head.appendChild(viewport)
  }
  viewport.setAttribute(
    'content',
    'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no'
  )

  // Address deprecation warning: include mobile-web-app-capable
  let webAppCapable = document.querySelector('meta[name="mobile-web-app-capable"]')
  if (!webAppCapable) {
    webAppCapable = document.createElement('meta')
    webAppCapable.setAttribute('name', 'mobile-web-app-capable')
    webAppCapable.setAttribute('content', 'yes')
    document.head.appendChild(webAppCapable)
  }
}

export const disableZoom = () => {
  document.addEventListener('touchmove', (e) => {
    if ((e as any).scale !== 1) {
      e.preventDefault()
    }
  }, { passive: false })

  document.addEventListener('dblclick', (e) => {
    e.preventDefault()
  }, { passive: false })
}

export const enableStatusBarColor = (color: string) => {
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}
