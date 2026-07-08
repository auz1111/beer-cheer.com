const beerBottles = [
  { path: 'beer-cheer-bottle-1.png', type: 'beer-bottle' },
  { path: 'beer-cheer-bottle-2.png', type: 'beer-bottle' },
  { path: 'beer-cheer-bottle-3.png', type: 'beer-bottle' },
  { path: 'beer-cheer-bottle-4.png', type: 'beer-bottle' },
  { path: 'beer-cheer-bottle-5.png', type: 'beer-bottle' },
  { path: 'beer-cheer-bottle-2.png', type: 'beer-bottle' },
  { path: 'beer-cheer-bottle-3.png', type: 'beer-bottle' },
  { path: 'beer-cheer-bottle-4.png', type: 'beer-bottle' },
  { path: 'bad-beer-cheer-bottle-1.png', type: 'bad-beer-bottle' },
  { path: 'beer-cheer-empty-bottle-5.png', type: 'empty-beer-bottle' },
  { path: 'beer-cheer-half-empty-bottle-10.png', type: 'empty-beer-bottle' },
]

const getRandomBottle = () => {
  const index = Math.floor(Math.random() * beerBottles.length)
  return beerBottles[index]
}

export function initLegacyBottleAnimations() {
  const bottles = document.querySelectorAll('.beer-bottle')

  if (bottles.length === 0) {
    return () => {}
  }

  const listeners = []

  bottles.forEach((bottle) => {
    const onClick = () => {
      bottle.classList.toggle('paused')
      bottle.style.zIndex = '11'
    }

    const onAnimationIteration = () => {
      const randomBottle = getRandomBottle()
      bottle.style.backgroundImage = `url(/legacy/images/${randomBottle.path})`
      bottle.dataset.type = randomBottle.type

      const randomZIndex = Math.floor(Math.random() * (100 - 12 + 1) + 12)
      bottle.style.zIndex = String(randomZIndex)
    }

    bottle.addEventListener('click', onClick)
    bottle.addEventListener('animationiteration', onAnimationIteration)

    listeners.push({ bottle, onClick, onAnimationIteration })
  })

  return () => {
    listeners.forEach(({ bottle, onClick, onAnimationIteration }) => {
      bottle.removeEventListener('click', onClick)
      bottle.removeEventListener('animationiteration', onAnimationIteration)
    })
  }
}
