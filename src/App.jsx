import { useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { initLegacyBubbleCanvas } from './legacy/bubble'
import { initLegacyBottleAnimations } from './legacy/bottles'

const merchItems = [
  {
    href: 'https://www.teepublic.com/t-shirt/55768516-beer-cheers?store_id=154632',
    img: '/merch/tie-dye-tee.webp',
    label: 'Beer Cheer Tie-Dye Tee',
  },
  {
    href: 'https://www.teepublic.com/poster-and-art/55770008-beer-cheer',
    img: '/merch/wall-art.webp',
    label: 'Beer Cheer Wall Art',
  },
  {
    href: 'https://www.teepublic.com/t-shirt/55770147-beer-cheer-logo?store_id=154632',
    img: '/merch/pink-tee.webp',
    label: 'Beer Cheer Pink Tee',
  },
  {
    href: 'https://www.teepublic.com/mug/55770008-beer-cheer',
    img: '/merch/mug.webp',
    label: 'Beer Cheer Mug',
  },
  {
    href: 'https://www.teepublic.com/sticker/55770482-beer-cheer-logo-dark',
    img: '/merch/sticker.webp',
    label: 'Beer Cheer Sticker',
  },
  {
    href: 'https://www.teepublic.com/t-shirt/55770008-beer-cheer',
    img: '/merch/purple-tee.jpg',
    label: 'Beer Cheer Purple Tee',
  },
  {
    href: 'https://www.teepublic.com/t-shirt/55768516-beer-cheers?store_id=154632',
    img: '/merch/shirt.webp',
    label: 'Beer Cheer Shirt',
  },
  {
    href: 'https://www.teepublic.com/sticker/55770008-beer-cheer',
    img: '/merch/sticker-alt.webp',
    label: 'Beer Cheer Sticker Alt',
  },
  {
    href: 'https://www.teepublic.com/hoodie/55770147-beer-cheer-logo',
    img: '/merch/hoodie.webp',
    label: 'Beer Cheer Hoodie',
  },
]

function HomePage() {
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
                <h2 className="wp-block-heading">Play NOW!</h2>
                <p className="wp-block-paragraph">
                  BEER * CHEER is on Google Play for Android.
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
              <h3 className="widget-title">Get The App On Google Play</h3>
              <div className="textwidget custom-html-widget">
                Download BEER * CHEER for Android and start bottling your way to the
                highest score.
                <br />
                <br />
                <div>
                  <p className="has-text-align-center">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.pushupz.app"
                      className="link-button button4 google-play-badge-link"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Get it on Google Play"
                    >
                      <img
                        src="/branding/google-play-badge.png"
                        className="google-play-badge"
                        alt="Get it on Google Play"
                      />
                    </a>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <main className="main-content pattern">
        <div className="inner flex-container">
          <div className="full-width-col">
            <article className="entry-content">
              <div className="video-zone">
                <div className="responsive-video">
                  <iframe
                    src="https://www.youtube.com/embed/hCs3cS8HLRE?si=3P7wR_ck9cXunRFX"
                    title="Beer Cheer trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <div className="suds-transition suds-to-white" aria-hidden="true"></div>

              <section className="text-zone" aria-label="Game description">
                <p>
                  <span className="rainbow-text">BEER CHEER</span> is a competitive and
                  skill-based game where players compete to pass bottles through a
                  production bottling line before time is up!
                </p>

                <p>
                  Be prepared to keep bottles from tipping over or exploding from too
                  much carbonation. Be quick to remove BAD beer from the line, and keep
                  the beer fans from disapproving. Some bottles require caps and others
                  require filling. Be strategic and achieve the highest score!
                </p>

                <p>
                  The game is based on the busy and bursting beer industry and puts a
                  fun and challenging spin on the industry&apos;s bottling line. Explore
                  breweries around the world while helping keep the bottling line running
                  smooth.
                </p>
              </section>

              <div className="suds-transition suds-to-gold" aria-hidden="true"></div>

              <section className="merch-zone" aria-label="Beer Cheer merchandise">
                <section className="merch-gallery" aria-label="Beer Cheer merchandise">
                  {merchItems.map((item) => (
                    <a
                      key={item.img}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="merch-card"
                      aria-label={item.label}
                    >
                      <img src={item.img} alt={item.label} loading="lazy" />
                    </a>
                  ))}
                </section>
              </section>
            </article>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function OpenTestingPage() {
  return (
    <div className="open-testing-page">
      <div className="open-testing-header-area full">
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
                <div className="clear"></div>
              </div>
            </header>
          </div>
        </div>
      </div>

      <div id="navigation-band">
        <div className="inner navspot">
          <nav id="site-navigation" className="main-navigation" role="navigation"></nav>
        </div>
      </div>

      <main className="open-testing-main">
        <div className="open-testing-inner">
          <h1>Beer Cheer Open Testing for Android</h1>

          <p>🍻 Calling all beer enthusiasts and mobile gaming aficionados! 🎮</p>

          <p>
            Are you ready to dive into the thrilling world of beer production like
            never before? Say hello to Beer Cheer - a skill based arcade action game
            that will put your reflexes to the test!
          </p>

          <p className="open-testing-play-link">
            <a
              href="https://play.google.com/store/apps/details?id=com.jeca.bendbeerbottles"
              target="_blank"
              rel="noreferrer"
              aria-label="Download Beer Cheer on Google Play"
            >
              <img src="/open-testing/android.png" alt="Get it on Google Play" />
            </a>
          </p>

          <p>
            In Beer Cheer, you&apos;ll be at the forefront of the action, racing against
            the clock to pass bottles through the production line with finesse. But
            watch out for exploding bottles and pesky quality control issues - only
            the most agile players will emerge victorious!
          </p>

          <div className="open-testing-about">
            <img
              src="/open-testing/auz-clement.jpg"
              alt="Auz Clement, Beer Cheer developer"
            />

            <p>
              My name is Auz and I am the sole developer of this new up and coming
              mobile game. This is the first game I have ever released and I am very
              excited to share it with the world. I am an old school arcade gamer and
              this crafty lil beer game has been inspired by the likes of the original
              Tapper and Ice Cold Beer arcade machines. Keep in mind that this is not
              a AAA blockbuster title created by a well funded studio. This is a small
              hand crafted mobile game that hopefully you will enjoy. It is great for
              passing time while on a plane, train, or automobile. It is even great
              for waiting in long beer lines at the festival!
            </p>
          </div>

          <p>
            So, are you up for the challenge? Join us for the Beer Cheer open beta,
            running from May 20 to June 22. As a beta tester, you&apos;ll not only help
            shape the game&apos;s development but also stand a chance to win exclusive
            Beer Cheer swag and a gift card to a local brewery!
          </p>

          <p className="open-testing-banner">
            <img src="/open-testing/beer-cheer-swag.png" alt="Beer Cheer swag" />
          </p>

          <p>
            To join the Beer Cheer open testing phase please download the game from
            the{' '}
            <a
              href="https://play.google.com/store/apps/details?id=com.jeca.bendbeerbottles"
              target="_blank"
              rel="noreferrer"
            >
              google play store here
            </a>
            . Make sure to sign in with your Google Play Games account and start
            playing. We are asking that you play for at least an hour before filling
            out the required survey. While playing take a few screenshots of your high
            scores. When you are done playing please complete the required feedback
            form located{' '}
            <a
              href="https://beercheer.wpenginepowered.com/beer-cheer-gameplay-feedback-1/"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>{' '}
            for your chance to win! The feedback form consist of questions regarding
            your experience with the game and the first 10 levels/scenes.
          </p>

          <p>
            Follow us on Instagram or X @beercheergame to share your screenshots with
            the hashtag #BeerCheerGame to better your odds with more entries! The
            player that post a picture with the highest score and their Google Play
            Games screen name will be eligible for a special prize. You may also leave
            your feedback here in the comment&apos;s section of this page.
          </p>

          <p className="open-testing-banner">
            <img
              src="/open-testing/beer-cheer-screenshot-1.png"
              alt="Beer Cheer gameplay screenshot"
            />
          </p>

          <p>
            Looking to connect with fellow players and stay updated on all things Beer
            Cheer? Need some tips on how to win? Or just want to leave some feedback
            for Auz then please join our official Discord Open Beta channel{' '}
            <a
              href="https://discord.com/channels/1191814149647380561/1240039678087008338"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>{' '}
            and let the fun begin!
          </p>

          <p>
            Don&apos;t miss out on this exciting opportunity to be part of the Beer Cheer
            community. Cheers to an epic adventure filled with bottles, brews, and
            lots of cheers! 🍺🎉
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <h1>Privacy Policy</h1>
        <p>
          Beer Cheer respects your privacy. This page describes what information may
          be collected when you visit this website and how it is used.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We may collect basic analytics data such as page views, browser type, and
          referring pages to help us improve site performance and content.
        </p>
        <h2>How Information Is Used</h2>
        <p>
          Information is used to operate and improve the Beer Cheer website, maintain
          security, and understand visitor engagement.
        </p>
        <h2>Third-Party Links</h2>
        <p>
          This site links to third-party services such as merchandise stores and video
          platforms. Those websites have their own privacy policies and practices.
        </p>
        <h2>Contact</h2>
        <p>
          For questions about this policy, use the official Beer Cheer channels linked
          on the main site.
        </p>
      </div>
      <SiteFooter />
    </div>
  )
}

function TermsOfUsePage() {
  return (
    <div className="legal-page">
      <div className="legal-inner">
        <h1>Terms of Use</h1>
        <p>
          By using this website, you agree to these terms. If you do not agree, please
          do not use the site.
        </p>
        <h2>Website Content</h2>
        <p>
          Content is provided for general information and promotional purposes for Beer
          Cheer. Availability and content may change without notice.
        </p>
        <h2>External Services</h2>
        <p>
          Links to third-party websites are provided for convenience. Beer Cheer is not
          responsible for external content, policies, or transactions.
        </p>
        <h2>Intellectual Property</h2>
        <p>
          Beer Cheer branding, visuals, and related content are protected by applicable
          intellectual property laws and may not be reused without permission.
        </p>
        <h2>Limitation of Liability</h2>
        <p>
          The website is provided on an "as is" basis without warranties of any kind.
          Beer Cheer is not liable for damages resulting from use of this site.
        </p>
      </div>
      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return (
    <div className="footer-area full">
      <div className="social-footer inner" aria-label="Social links">
        <a href="https://discord.gg/RuKDwG7Xxa" target="_blank" rel="noreferrer">
          Discord
        </a>{' '}
        |{' '}
        <a
          href="https://www.youtube.com/channel/UCTPpFNZezP6Y5lV1wvaLNoQ"
          target="_blank"
          rel="noreferrer"
        >
          Youtube
        </a>{' '}
        |{' '}
        <a
          href="https://www.facebook.com/beercheergame/"
          target="_blank"
          rel="noreferrer"
        >
          facebook
        </a>{' '}
        |{' '}
        <a
          href="https://www.instagram.com/beercheergame/"
          target="_blank"
          rel="noreferrer"
        >
          instagram
        </a>{' '}
        |{' '}
        <a
          href="https://x.com/beercheergame"
          target="_blank"
          rel="noreferrer"
        >
          X.com
        </a>
      </div>

      <footer id="colophon" className="site-footer inner" role="contentinfo">
        <div className="footer-box full">
          © BEER * CHEER | All Right Reserved | View our{' '}
          <Link to="/privacy-policy">Privacy Policy</Link> |{' '}
          <Link to="/terms-of-use">Terms of Use</Link> |{' '}
          <a
            href="https://www.teepublic.com/user/beer-cheer"
            target="_blank"
            rel="noreferrer"
          >
            Shop Merch
          </a>{' '}
          |{' '}
          <a
            href="https://www.youtube.com/watch?v=hCs3cS8HLRE"
            target="_blank"
            rel="noreferrer"
          >
            Trailer
          </a>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/beer-cheer-open-testing" element={<OpenTestingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
