export function initLegacyBubbleCanvas() {
  const largeHeader = document.getElementById('large-header')
  const canvas = document.getElementById('bubble-canvas')

  if (!largeHeader || !canvas) {
    return () => {}
  }

  let width = window.innerWidth
  let height = 400
  let animateHeader = true
  const ctx = canvas.getContext('2d')
  const circles = []
  let frameId = null

  if (!ctx) {
    return () => {}
  }

  const setCanvasSize = () => {
    width = window.innerWidth
    height = 400
    largeHeader.style.height = `${height}px`
    canvas.width = width
    canvas.height = height
  }

  class Circle {
    constructor() {
      this.pos = { x: 0, y: 0 }
      this.alpha = 0
      this.scale = 0
      this.velocity = 0
      this.reset()
    }

    reset() {
      this.pos.x = Math.random() * width
      this.pos.y = height + Math.random() * 100
      this.alpha = 0.1 + Math.random() * 0.3
      this.scale = 0.1 + Math.random() * 0.3
      this.velocity = Math.random()
    }

    draw() {
      if (this.alpha <= 0) {
        this.reset()
      }

      this.pos.y -= this.velocity
      this.alpha -= 0.0005

      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.scale * 10, 0, 2 * Math.PI, false)
      ctx.fillStyle = `rgba(255,255,255,${this.alpha})`
      ctx.fill()
    }
  }

  const populateCircles = () => {
    circles.length = 0

    for (let x = 0; x < width * 0.5; x += 1) {
      circles.push(new Circle())
    }
  }

  const onScroll = () => {
    animateHeader = window.scrollY <= height
  }

  const onResize = () => {
    setCanvasSize()
    populateCircles()
  }

  const animate = () => {
    if (animateHeader) {
      ctx.clearRect(0, 0, width, height)
      circles.forEach((circle) => circle.draw())
    }

    frameId = window.requestAnimationFrame(animate)
  }

  setCanvasSize()
  populateCircles()
  onScroll()
  animate()

  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)

  return () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)

    if (frameId !== null) {
      window.cancelAnimationFrame(frameId)
    }
  }
}
