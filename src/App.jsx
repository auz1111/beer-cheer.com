import { useEffect } from 'react'
import './App.css'
import { initLegacyBubbleCanvas } from './legacy/bubble'
import { initLegacyBottleAnimations } from './legacy/bottles'

function App() {
  useEffect(() => {
    const cleanupBubble = initLegacyBubbleCanvas()
    const cleanupBottles = initLegacyBottleAnimations()

    return () => {
      cleanupBubble?.()
      cleanupBottles?.()
    }
  }, [])

  return (
    <div className="beer-cheer-site">
      <div className="header-area full">
        <div className="pattern">
          <div className="main-page">
            <header id="masthead" className="site-header" role="banner">
              <div id="branding-band">
                <div className="site-branding">
                  <p className="site-title">
                    <a href="/" rel="home" aria-label="Beer Cheer home">
                      <span className="logo-text">Beer Cheer</span>
                    </a>
                  </p>
                  <span className="site-title-gear"></span>
                  <span className="site-title-gear-2"></span>
                  <p className="site-description">A crafty little beer game.</p>
                </div>
              </div>

              <div className="featured-cta">
                <h2 className="wp-block-heading">Play NOW to Win!</h2>
                <p className="wp-block-paragraph">
                  BEER * CHEER is now in Open Testing for Android. Join us to win cool
                  prizes from your local brewery and Beer Cheer swag!
                </p>
              </div>
            </header>
          </div>
        </div>

        <div className="beer-bottles" aria-hidden="true">
          <span id="beer-bottle-1" className="moving-bottle beer-bottle"></span>
          <span id="beer-bottle-2" className="moving-bottle beer-bottle odd"></span>
          <span id="beer-bottle-3" className="moving-bottle beer-bottle"></span>
          <span id="beer-bottle-4" className="moving-bottle beer-bottle odd"></span>
          <span id="beer-bottle-5" className="moving-bottle beer-bottle"></span>
        </div>
        <span id="conveyor-belt"></span>
      </div>

      <div id="large-header">
        <canvas id="bubble-canvas" aria-hidden="true"></canvas>

        <div className="email-signup">
          <div className="inner">
            <aside className="widget_text widget widget_custom_html">
              <h3 className="widget-title">Play now to win prizes!</h3>
              <div className="textwidget custom-html-widget">
                Join our Open Testing Phase II from June 22 - July 22, 2024 to win!
                <br />
                <br />
                <div>
                  <p className="has-text-align-center">
                    <a
                      href="https://beer-cheer.com/beer-cheer-open-testing/"
                      className="link-button button4"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Join us!
                    </a>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <section className="hero-footer">
        <h3>Play now to win prizes!</h3>
        <p>Join our Open Testing Phase II from June 22 - July 22, 2024 to win!</p>
      </section>
    </div>
  )
}

export default App
