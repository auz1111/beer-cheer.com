import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import 'quill/dist/quill.snow.css'
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

const ADMIN_TOKEN_KEY = 'beerCheerAdminToken'

function getApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) {
    return String(configured).replace(/\/$/, '')
  }

  // Default to same-origin API paths.
  // In local dev, Vite proxy can forward /api to production or another API host.
  return ''
}

const API_BASE = getApiBase()

function apiUrl(path) {
  return `${API_BASE}${path}`
}

function formatPublishDate(value) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toRenderableHtml(value) {
  const raw = String(value || '')
  const trimmed = raw.trim()

  if (!trimmed) {
    return ''
  }

  // Legacy imported posts already contain rendered HTML; new admin posts are often plain text.
  if (/[<][a-z!/]/i.test(trimmed)) {
    return raw
  }

  return escapeHtml(raw).replace(/\r?\n/g, '<br />')
}

async function parseJsonSafe(response) {
  const text = await response.text()
  if (!text) {
    return {}
  }

  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function getLoginErrorMessage(response, data, err) {
  if (response) {
    if (response.status === 404) {
      if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        return 'Local API not found. Set VITE_API_BASE_URL or run SWA CLI with the api folder.'
      }
      return 'Login API not found. Deployment may still be in progress.'
    }

    if (response.status === 401) {
      return 'Invalid credentials. Check your username and password.'
    }

    if (response.status === 503) {
      return data.message || 'Login service is not configured yet.'
    }

    if (response.status >= 500) {
      return 'Server unavailable. Please try again in a minute.'
    }

    return data.message || 'Login failed. Please try again.'
  }

  if (err?.name === 'TypeError') {
    return 'Unable to reach API. If running locally, restart npm run dev so /api proxy is active.'
  }

  return err?.message || 'Login failed. Please try again.'
}

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
        <Link to="/" className="legal-logo-link" aria-label="Back to Beer Cheer home">
          <img
            src="/legacy/images/beer-cheer-logo-no-gear.png"
            alt="Beer Cheer"
            className="legal-logo"
          />
        </Link>
        <h1>Privacy Policy</h1>
        <p>
          Digital Thoughts Media (DTM) and any one of its parent, subsidiary or
          affiliated companies, including without limitation, Jeca Designs, respect
          the privacy rights of our visitors and users (“Users”) and recognize the
          importance of protecting all information that you may choose to share with
          us. To further this commitment, we have adopted this Privacy Policy
          (“Policy”) to guide how we collect, store, use and share the information
          you provide us when you access Digital Thought Media’s websites, mobile
          sites and applications, online games, online functions of offline games
          and any other online functions controlled, accessed by DTM as described
          herein (collectively, the “Services”). If you do not agree to the terms of
          this Policy, please do not use the Services.
        </p>

        <p>
          We reserve the right to change the provisions of this Policy at any time.
          We will alert you that changes have been made by indicating on the Policy
          the date it was revised. We encourage you to review this Policy from time
          to time to make sure that you understand how any personal information you
          provide will be used.
        </p>

        <p>
          Your continued use of the Services following the posting of changes to
          these terms will mean you accept those changes.
        </p>

        <h2>Table of Contents</h2>
        <ul>
          <li><a href="#what-is-personal-information">What is Personal Information?</a></li>
          <li><a href="#what-types-of-personal-information-do-we-collect">What types of Personal Information do we collect about our Users?</a></li>
          <li><a href="#how-is-personal-information-used-and-shared">How is Personal Information used and shared?</a></li>
          <li><a href="#do-we-share-personal-information-with-third-parties">Do we share Personal Information with third parties?</a></li>
          <li><a href="#what-choices-do-you-have">What choices do you have about the collection, use, and sharing of Personal Information?</a></li>
          <li><a href="#does-dtm-collect-information-from-children-under-13">Does DTM collect information from children under the age of 13?</a></li>
          <li><a href="#what-kinds-of-security-measures">What kinds of security measures do we take to safeguard Personal Information?</a></li>
          <li><a href="#how-long-does-dtm-use-my-personal-information">How long does DTM use my Personal Information?</a></li>
          <li><a href="#does-this-policy-apply-to-other-sites-linked-to-the-services">Does this Policy apply to other sites linked to the Services?</a></li>
          <li><a href="#how-can-you-access-and-update-your-personal-information">How can you access and update your Personal Information and account profile?</a></li>
          <li><a href="#dtm-terms-of-use">Digital Thoughts Media’s Terms of Use</a></li>
          <li><a href="#how-can-you-ask-questions-or-send-comments-about-this-policy">How can you ask questions or send comments about this Policy?</a></li>
        </ul>

        <h2 id="what-is-personal-information">1. What is Personal Information?</h2>
        <p>
          As used herein, the term “personal information” means information that
          specifically identifies any individual (including without limitation,
          name, date of birth, address, telephone/mobile number, e-mail address, or
          payment/billing information), and any other information that is required by
          applicable law to be treated as Personal Information (“Personal
          Information”).
        </p>

        <p>
          Personal Information does not include “aggregate” or “anonymized”
          information”, which is data we collect about a User’s, or group or category
          of Users’, use of the Services and/or other sites or services (including
          without limitation, demographic or preference information) from which
          individual identities or other Personal Information has been removed. Please
          note, if DTM combines this information with Personal Information, DTM will
          treat this information as Personal Information pursuant to this Policy.
        </p>

        <h2 id="what-types-of-personal-information-do-we-collect">2. What types of Personal Information do we collect about our Users?</h2>
        <p>
          We collect Personal Information about our Users in a number of ways when
          you visit or use the Services:
        </p>

        <p>
          Active Collection: We collect certain information from you when you provide
          it, such as if you: Create a DigiPlay or game account; Apply for a beta or
          alpha tester position; Subscribe to one of our newsletters or other
          promotional content; Email-a-friend; Participate in our community forums or
          chat rooms; Create a public profile; Shop at one of our online stores or
          purchase virtual items within a DTM’s game; Receive customer or technical
          support; Participate in contests, events, or promotions; Register product
          online for warranty protection; and Polls, surveys, or questionnaires.
        </p>

        <p>
          Typically, the Personal Information collected includes: name; email address;
          telephone number; shipping and billing address; date of birth, and payment
          information for those purchasing products through the Services.
          Additionally, we may also collect demographic information such as your age,
          gender, country and zip code of residence, other geo-locational
          information, recent game purchases, and game ownership and preferences. This
          demographic information may be associated with your Personal Information.
          If this demographic information is connected with Personal Information, we
          will treat the demographic information as Personal Information.
        </p>

        <p>
          Passive Collection: Furthermore, DTM may collect information regarding your
          behavior to better adapt our products and Services to your interests and to
          provide a better quality of Services. DTM may on its own, or with the help
          of third party analytics tools, collect information concerning your and
          other Users’ gaming habits, hardware and use of our products and Services.
          The information collected may contain the following, without limitation:
          device unique identity, including console, mobile, tablet and console unique
          identifier or other device identifiers and settings, internet provider,
          carrier, operating system, hardware information, localization information,
          date and time spent on the Services, game scores, game metrics and
          statistics, feature usage, advertising conversion rates, monetization rate,
          purchase history and other similar information. Standing alone, this
          information may not be Personal Information; however, if DTM combines any
          of this information with Personal Information, DTM will treat this
          information as Personal Information pursuant to this Policy.
        </p>

        <p>
          Cookies: DTM uses cookies on the Services. A “cookie” is a small bit of
          record-keeping information that websites often store on a User’s computer.
          Cookies are typically used to quickly identify a User’s computer and to
          “remember” things about the User’s visit. DTM may set cookies for your web
          browser as you visit our websites, use our products or visit a website
          where DTM provides ads, content or analytics. You can disable cookies or
          set your browser to alert you when cookies are being sent to your computer,
          although this may affect your ability to shop online or to access certain
          features of our Services. Each browser is different, so check the “Help”
          menu of your browser to learn how to change your cookie preferences. In
          addition to DTM using cookies on Services and our network of websites, DTM
          allow certain partners to set and access their cookies on your computer.
          These companies use of cookies is subject to their own privacy policies, not
          the DTM Privacy Policy. Please review them carefully. For more information
          about cookies, please see http://www.allaboutcookies.org. Please note, if
          you choose to remove or reject cookies, this could affect certain features on
          the Services.
        </p>

        <p>
          DTM makes its best efforts to (a) provide you with the list of partners
          whose cookies and other analytic tools are used in our Services, (b) links
          to these partners’ own privacy policies according to which their tools and
          technologies are used, and (c) when available, to provide you with a link
          to allow you to opt-out from these partners’ services. To that end, you
          will find such non-exhaustive list here: https://legal.ubi.com/cookies/.
        </p>

        <p>
          Third Parties: We may obtain certain information about you from third
          parties, including Personal Information. Please note: DTM is not
          responsible for the privacy and security practices and policies of such
          third parties.
        </p>

        <h2 id="how-is-personal-information-used-and-shared">3. How is Personal Information used and shared?</h2>
        <p>
          We don’t require Personal Information to access our Services. However, if
          you prefer not to disclose Personal Information, to the extent permitted by
          applicable law, you will not be able to register and/or enjoy certain
          features of our Services. We use Personal Information we collect through
          the Services for the purposes described in this Policy.
        </p>

        <p>
          For example: To provide the Services, products or information you request
          and to process and complete any transactions in connection therewith; To
          communicate with you and respond to your emails, submissions, questions,
          inquiries, comments, requests, and complaints and to provide customer
          service. For instance, we may use your email address to send you service
          announcements that tell you about updates to our Terms of Use or this
          Policy, changing in pricing, changes to the Services or our online service
          or customer support policies. To monitor and analyze the Services usage and
          trends and otherwise measure the effectiveness of the Services or request
          feedback from you about the Services; To send you confirmations, updates,
          security alerts, and support and administrative messages, to detect and
          prevent fraud, and to otherwise facilitate your use of, and our
          administration and operation of, the Services; To conduct surveys contests
          and sweepstakes; To operate the Services, including, without limitation,
          payment processing, and products delivery; and To personalize and improve
          the Services and Users’ experiences, to increase the functionality and User
          friendliness of the Services, to deliver advertisements, newsletters,
          coupons, promotions, rewards, awards or other content, or features that
          match User profiles or interests on the Services, and to provide
          recommendations as to other advertisements, content or features that may be
          of interest to Users on the Services; To provide you with news and
          information about our third party events, activities, offers, promotions,
          products, and services we think will be of interest to you; For any other
          purpose as described in this Policy or for which we notified you the
          information will be collected, used and shared and received your consent.
          Interest Based Advertising: We may use third party ad serving technologies
          that collect information as a result of ad serving in the products and
          Services, and then temporarily display advertisements on the Services and
          third party sites. The information collected and used for the interest based
          advertising may contain the following, without limitation: age and gender,
          number views of an advertisement, device unique identity or other device
          identifiers and settings, information about your use of the products and
          Services and other Internet sites (including third party web pages and
          mobile Internet sites) viewed by you (as well as date and time viewed),
          advertisement(s) served, the advertisement(s)’ in game location and length,
          and your response to the advertisement(s) (if any). The analytics tools and
          ad serving technologies may use server log files, web beacons, cookies (as
          further described below), tracking pixels and other technologies to collect
          said information, and may combine the information collected on other DTM
          products and services with information collected from other third party
          sites and mobile products and services and with demographic, advertisement,
          market and other analytics surveys. Standing alone, this information may
          not be Personal Information; however, if we combine any of this information
          with Personal Information to serve you such interest based advertising, we
          will provide you an opportunity to opt-out of such combination and treat
          this information as Personal Information pursuant to this Policy. We make
          our best efforts to (a) provide you with the list of partners whose ad
          serving technologies are used in our Services, (b) links to these partners’
          own privacy policies according to which their tools and technologies are
          used, and (c) when available, to provide you with a link to allow you to
          opt-out from these partners’ services. You can opt out of some third-party
          technology’s use of cookies for interest-based advertising by visiting
          aboutads.info.
        </p>

        <h2 id="do-we-share-personal-information-with-third-parties">4. Do we share Personal Information with third parties?</h2>
        <p>
          We will only share the Personal Information we collect from you through the
          Services with third parties as described in this Policy or otherwise as
          detailed at the time of collection. For example, we may share Personal
          Information as follows:
        </p>

        <p>
          With vendors, consultants, and/or other service providers (“Service
          Providers”) who are engaged by or working with us in connection with the
          operation of the Services and/or the promotion of DTM products and who need
          access to such information to carry out their work; With other Users of the
          Services as described herein; and With promotional partners to send you
          coupons, promotions, rewards, awards and advertisements you request. To the
          extent that third parties have access to your Personal Information,
          whenever possible, we will request that they will follow practices that are
          at least as restrictive as the practices described in this Policy;
        </p>

        <p>
          We will also use and share information, including Personal Information, for
          the purposes specifically described below:
        </p>

        <p>
          Custom Content: We may share the Personal Information collected by us
          pursuant to this Policy with promotional partners to display customized
          content on our Services or third party sites that we think will be of
          interest to you. To opt out of this type of sharing of Personal Information
          by DTM, please update your settings in your DigiPlay account, as further
          described below in “Custom Content Opt-Out”.
        </p>

        <p>
          Public Profile: BEER-CHEER.com and other brand specific DTM sites may offer
          a public profile feature (“Public Profile”) that allows you to publish
          information, including Personal Information, to the public Internet. Other
          than as stated on the applicable public profile site, the information you
          upload or input to your Public Profile will default to the privacy level
          you choose at sign-in, and you can choose to change the privacy settings at
          any time. Those aspects of the Public Profile that are designated as
          “public” will be visible by everyone, including people off the DTM
          environment, and may be indexed and displayed through public search engines
          when someone searches for you. If you post your Personal Information to a
          Public Profile, including a video, image or photo, you should be aware that
          these may be viewed, collected, copied and/or used by other Users without
          your consent, and there is no expectation of privacy or confidentiality
          there. We are not responsible for disclosure by other Users of your
          Personal Information, including without limitation, videos, images or
          photos that you choose to submit to DTM’s sites. Also, please remember that
          the Personal Information you provide to us as part of your Public Profile
          may reveal or allow others to identify aspects of your life that you may
          not choose to state on your Public Profile directly (for example, your
          picture may reveal your gender).
        </p>

        <p>
          Friend Finder tools: By using friend finder tools, you acknowledge that use
          of these tools will help you find your contacts and will also allow your
          contacts to associate your Uplay account, other DTM accounts if any (and
          related gaming entitlements, including games played on PC, mobile and
          console platforms) with your social networking profile and/or email
          address. Your resulting friends’ list, which may be accessible across DTM
          sites, will be subject to this Policy. Note that the friends that you
          choose to include on any friends’ list may be able to find and/or identify
          you in the context of different DTM products and Services, and may see the
          profiles and information you have made visible to them or to everyone.
          Similarly, DTM may also collect or receive information about you from other
          Users who choose to upload their email and other contacts. This information
          will be stored by us and used primarily to help you and your friends
          connect.
        </p>

        <p>
          Console Accounts/ Social Networks: By playing an DTM game through a social
          network or other third party platform or service, or by connecting to a
          third party account, network, platform or service via one of our products
          and/or Services, you are authorizing DTM to (1) collect, store, and use, in
          accordance with this Policy, any and all information that you agreed that
          the console manufacturer, social network or other third party platform
          could provide to DTM based on your settings on your console account, the
          third party social network or platform and (2) share any and all of your
          Personal Information with the console manufacturer, social network or other
          third party platform, through the third party platform’s Application
          Programming Interface (API). Your agreement to this takes place when you
          connect with the third party network, platform or service via our products
          and/or services, and/or when you connect with, “accept” or “allow” (or
          similar terms) one of our applications through the third party platform or
          service.
        </p>

        <p>
          Online Events and Promotions: Your participation in online events and
          promotions may be conditional upon DTM’s collection, use, storage,
          transmission and public display of statistical data (such as your scores,
          rankings and achievements) generated through your participation. This
          statistical data may include your Personal Information.
        </p>

        <p>
          Business Information: For practical reasons, we treat Personal Information
          submitted to us in a business capacity different from information we
          receive in a non-business capacity. Personal Information submitted to us in
          a business capacity (e.g. resumes) may be shared with third parties as
          described at the time of collection
        </p>

        <p>
          Purchase or Sale of Businesses: From time to time, we may purchase a
          business or sell one or more of our businesses and your Personal
          Information may be transferred as a part of the purchase or sale. If we
          purchase a business, the Personal Information received with that business
          would be treated in accordance with this Policy, if it is practicable and
          permissible to do so. If we sell a business, whenever possible, we will
          include provisions in the selling contract requiring the purchaser to treat
          your Personal Information in the same manner required by this Policy. The
          provisions of this paragraph will also apply if we are sold as part of
          bankruptcy proceedings.
        </p>

        <p>
          Disclosures required by law and to protect the security and safety of
          Users: We will disclose Personal Information when we believe in good faith
          that such disclosures (a) are required by law, including, for example, to
          comply with a court order or subpoena, (b) will help to: enforce this
          Policy, our Terms of Use; enforce contest, sweepstakes, promotions, and/or
          game rules, (c) protect your safety or security, including the safety and
          security of property that belongs to you; and/or, protect the safety and
          security of DTM, or any third parties. Unless required by law, DTM will
          not be required to notify you of any such disclosure.
        </p>

        <p>
          You understand that when you use the Services, any information you post in
          any interactive areas of the Services, as well as any information you
          share with individuals through public or private groups or forums, as well
          as any information you share with individuals through the Services or
          through social network sites or other social feeds, will be available to
          other Users and in some cases may be publicly available. We recommend you
          be cautious about giving out Personal Information to others or sharing
          Personal Information in public or private online forums. Except to the
          extent required by applicable law, we are not responsible for the actions
          of third party service providers or other third parties, nor are we
          responsible for any additional information you provide directly to any such
          third parties. Therefore, we encourage you to become familiar with their
          privacy practices before disclosing information directly to any such third
          parties.
        </p>

        <h2 id="what-choices-do-you-have">5. What choices do you have about the collection, use, and sharing of your Personal Information?</h2>
        <p>
          As mentioned above, you have choices as to how we use the Personal
          Information you submit to us:
        </p>

        <p>
          Promotional E-mails: Once you register to our Services and/or purchase one
          of our products, DTM will send you promotional communications about its own
          products and Services that you may be interested in. If you do not wish to
          receive promotional e-mails from DTM, please follow one of these two
          options: (a) when you receive a promotional e-mail from us, it will contain
          a link or other instruction that allows you to stop the delivery of such
          messages from us and/or (2) contact us at support@beercheer.wpengine.com
          with your request. If you decide to opt-out of receiving promotional
          e-mails, you will no longer receive special offers, valuable coupons, new
          product introductions or e-newsletters from DTM. However, you will
          continue to receive non-promotional communications from us, such as order
          confirmations and/or important notifications about the Services and or your
          account(s). Your opt-out request will be processed within thirty (30) days
          of the date of which we receive it.
        </p>

        <p>
          Opt-Out of Custom Content: We may work with trusted marketing partners to
          bring you more useful and interesting content on our Services and on third
          party sites and services. The list of such trusted marketing partners is
          available at legal.ubi.com/active-sharing/. We may do this by sharing or
          matching the Personal Information you have provided us on the Services with
          the information (which may include Personal Information) you have provided
          third party marketing partners. If you do not want DTM to match your
          Personal Information with trusted partners to tailor ads or other custom
          content for you on our Services and/or third party sites, you can uncheck
          the box next to “Share my information with select third parties” in your
          DigiPlay account settings at any time. When you uncheck this box, DTM will
          no longer share your Personal Information with partners to tailor ads or
          other custom content for you following the date of your request.
        </p>

        <p>
          Please note that opting-out from the Custom Content will not change the
          behavior of third parties collecting information on the Services. Please
          note that opting-out from the Custom Content will not change the behavior
          of third parties collecting information on the Services. For more
          information as to how to opt-out of third party collection please go to:
          https://legal.ubi.com/cookies/.
        </p>

        <p>
          Do not Track: DTM does not respond to Do Not Track (DNT) settings in your
          browser.
        </p>

        <p>
          Your California Privacy Rights: The following applies solely to California
          residents who have an established business relationship with DTM. If we
          collect Personal Information from you, we may make the Personal Information
          available to third parties for their marketing and promotional purposes.
          If you decide that you do not want us to share your Personal Information
          with these companies for their marketing and promotional purposes, please
          send an e-mail to support@beercheer.wpengine.com. In this email, state that
          you would like DTM to not share your Personal Information with third
          parties for their marketing purposes. Your opt-out request will be
          processed within thirty (30) days of the date of which we receive it.
        </p>

        <h2 id="does-dtm-collect-information-from-children-under-13">6. Does DTM collect information from children under the age of 13?</h2>
        <p>
          Unless stated specifically to the contrary on the applicable DTM site,
          DTM’s Services are not intended for and are not advertised to children
          under 13 (“Child” or “Children”) and DTM will not request any Personal
          Information from Children. Therefore, DTM restricts access to certain
          Services on age grounds. In certain jurisdictions, for certain Services and
          functions, DTM may allow a Child to register for certain Services with
          parental approval.
        </p>

        <p>
          When Children are permitted to register for a Service with parental
          approval, we will take additional steps to protect the Children’s privacy,
          including:
        </p>

        <p>
          Notifying parents about our information practices with regard to Children,
          including the types of Personal Information we may collect from Children,
          the uses to which we may put that information, and whether and with whom we
          may share that information In accordance with applicable law, obtaining
          consent from parents for the collection and use of Personal Information
          from their Children Limiting our collection of Personal Information from
          Children to no more than is reasonably necessary to participate in an
          online activity Giving parents access or the ability to request access to
          Personal Information we have collected from their Children and the ability
          to request that the Personal Information be changed or deleted More
          specifically, when a Child registers, (s)he must supply the e-mail address,
          and/or other contact information of a parent or legal guardian who will be
          contacted by DTM to ask him/her to confirm, refuse to modify his/her
          Child’s registration. The parent/legal guardian may be asked to provide
          additional documentation or perform additional actions as part of the
          approval process as consistent with applicable law. DTM reserves the right
          to refuse access to the Service pending confirmation and activation by
          his/her parent or guardian. DTM reserves the right to ask for written proof
          of parental consent for any User or potential User of the services
          suspected to be a Child. Parental consent applies exclusively to the
          specific service for which it has been granted.
        </p>

        <p>
          Certain Services are specifically designed for Children and enable Children
          to create their own free accounts for which DTM collects their username or
          other identifier, password, date of birth (or age), photo, video, voice
          recording, country, zip code or other geo-locational information, and
          parent or guardian’s e-mail address and/or other parent or guardian contact
          information. Such Services sometimes offer the possibility of paying for a
          subscription or certain game functions which enable Children to participate
          in more activities on the Services by making a payment. The subscription
          services may also allow parents or guardians to manage their Child’s
          account and create their own player accounts.
        </p>

        <p>
          Certain Services enable Children to create personalized avatars which they
          can use in numerous activities in the services, including mini-games and
          virtual worlds. Children may also use other functions of the Services such
          as “Recommend to a friend” to invite a friend to find out about the
          Services. The “Recommend to a friend” functions enable Children to send
          their friends a single message inviting them to visit the related service.
          DTM will collect the first name and e-mail address of your Child (or,
          failing that, the e-mail address of the parent or guardian) and the
          e-mail address of his/her friend for the sole purpose of sending a single
          message. This information is neither stored nor used for any other purpose
          and we do not reveal your child’s e-mail address to the recipient.
        </p>

        <p>
          Parents may delete their Child’s account or change their Child’s privacy
          settings at any time by sending an e-mail to the administrator of the
          Policy, who is identified below. The deletion request will be processed
          within thirty (30) days of the date of which we receive it.
        </p>

        <p>
          In all cases, use of the Services by Children must take place under the
          responsibility of their parents or legal guardians and any use of the
          Services is assumed to have been validated by them. AS FAR AS IS PERMITTED
          BY APPLICABLE LEGISLATION, DTM DECLINES ANY RESPONSIBILITY REGARDING ANY
          ACTIVITIES WHICH MAY BE CONDUCTED BY CHILDREN WITHOUT THE PERMISSION OF
          THEIR PARENTS OR LEGAL GUARDIANS.
        </p>

        <p>
          IF YOU ARE A PARENT OR LEGAL GUARDIAN AND YOU GIVE YOUR PERMISSION FOR YOUR
          CHILD TO REGISTER FOR ONE OR OTHER OF THE SERVICES, YOU THEREBY AGREE TO
          THE TERMS RELATING TO USE OF THE SERVICES BY YOUR CHILD.
        </p>

        <h2 id="what-kinds-of-security-measures">7. What kinds of security measures do we take to safeguard Personal Information?</h2>
        <p>
          The security and confidentiality of your Personal Information is extremely
          important to us. We use robust security measures to protect Personal
          Information from loss, misuse and alteration. We use industry-standard
          practices such as encrypted communications, physically secured rooms,
          firewalls and password protection systems to safeguard the confidentiality
          of your Personal Information. From time to time, we review our security
          procedures to consider appropriate new technology and methods. However,
          please understand that, despite our best efforts, no security measure is
          perfect or impenetrable. Please note, we will notify Users of a data breach
          pursuant to applicable law.
        </p>

        <p>
          To protect the confidentiality of Personal Information maintained in your
          account, you must keep your password confidential and not disclose it to
          any other person. You are responsible for all uses of the Services by any
          person using your password. Please advise us immediately if you believe
          your password has been misused.
        </p>

        <p>
          DESPITE OUR REASONABLE EFFORTS TO KEEP YOUR PERSONAL INFORMATION SECURE, NO
          COMPANY CAN GUARANTEE THE SECURITY AND PRIVACY OF ITS SERVICES,
          INFORMATION AND OTHER DATA. OUR PRIVACY POLICIES AND PROCEDURES ARE “AS IS”
          AND DTM MAKES NO REPRESENTATIONS AS TO THE FITNESS FOR A PARTICULAR PURPOSE
          OR MERCHANTABILITY.
        </p>

        <h2 id="how-long-does-dtm-use-my-personal-information">8. How long does DTM use my Personal Information?</h2>
        <p>
          Unless a different use/storage period is required by applicable laws and
          regulations, DTM will use and store your Personal Information for a length
          of time necessary for the uses explained in this Policy.
        </p>

        <h2 id="does-this-policy-apply-to-other-sites-linked-to-the-services">9. Does this Policy apply to other sites linked to the Services?</h2>
        <p>
          The Services may contain links to other sites. For instance, purchases of
          Virtual Currency or Virtual Items for DTM Services may be transacted on a
          third party processors site. Any Personal Information you provide on linked
          pages or applications is provided directly to that third party and is
          subject to that third party’s privacy policy. This Policy does not apply to
          such linked sites, and we are not responsible for the content or privacy
          and security practices and policies of these websites or any other sites
          that are linked to or from the Services. We encourage you to learn about
          their privacy and security practices and policies before providing them
          with Personal Information.
        </p>

        <h2 id="how-can-you-access-and-update-your-personal-information">10. How can you access and update your Personal Information and account profile?</h2>
        <p>
          You can access and update the contact information you gave us during
          registration (that is, your e-mail address or any other information that
          would directly enable us to contact you), by logging in and clicking the
          Edit Profile section, or contacting us at support@beercheer.wpengine.com.
          You may be required to provide additional information in order for us to
          verify your request. Your request will be processed within thirty (30) days
          of the date of which we receive it.
        </p>

        <p>
          Users under 18. If you are under 18 (eighteen) years old and desire that
          your information you have posted to a DTM public facing site be removed
          from such site, please contact us at support@beercheer.wpengine.com. You
          may be required to provide additional information in order for us to
          verify your request.
        </p>

        <p>
          Please note, if information is deleted from our commercial databases and/or
          view by members of the public, DTM may still retain your information in
          our files, to resolve disputes, enforce our Terms of Use or other User
          agreements, and due to technical and legal requirements and constraints
          related to the security, integrity and operation of our Services. Your
          request will be processed within thirty (30) days of the date of which we
          receive it.
        </p>

        <h2 id="dtm-terms-of-use">11. DTM’s Terms of Use</h2>
        <p>
          The terms of this Policy are incorporated into our Terms of Use. Please
          review our Terms of Use at: legal.ubi.com/termsofuse. All terms in capital
          used in this Policy have the meaning as those defined in the Terms of Use
          located at legal.ubi.com/terms of use.
        </p>

        <h2 id="how-can-you-ask-questions-or-send-comments-about-this-policy">12. How can you ask questions or send comments about this Policy?</h2>
        <p>
          If you have questions or wish to send us comments about this Policy,
          please send an e-mail with your questions or comments to
          support@beercheer.wpengine.com.
        </p>

        <p>
          Please be assured that any Personal Information that you provide in
          communications to the above email will not be used to send you promotional
          materials, unless you request it.
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
        <Link to="/" className="legal-logo-link" aria-label="Back to Beer Cheer home">
          <img
            src="/legacy/images/beer-cheer-logo-no-gear.png"
            alt="Beer Cheer"
            className="legal-logo"
          />
        </Link>

        <h1>Terms of Use</h1>
        <p>
          These Terms of Use set out the agreement between Digital Thoughts Media
          (DTM) and each user. They govern your use of Beer Cheer websites, online
          game features, mobile experiences, and related services.
        </p>

        <p>
          By using the Services, you accept these Terms and the Privacy Policy. If
          you do not agree, do not use the Services.
        </p>

        <h2>Table of Contents</h2>
        <ol className="legal-toc">
          <li><a href="#terms-1">1. Description of Services and Limited License</a></li>
          <li><a href="#terms-2">2. Account</a></li>
          <li><a href="#terms-3">3. Use of Services and Rules of Conduct</a></li>
          <li><a href="#terms-4">4. Terms Specific to Minors</a></li>
          <li><a href="#terms-5">5. Intellectual Property Rights</a></li>
          <li><a href="#terms-6">6. User Generated Content</a></li>
          <li><a href="#terms-7">7. Reporting Unlawful Content</a></li>
          <li><a href="#terms-8">8. Technical Protection and DRM</a></li>
          <li><a href="#terms-9">9. Merchant Services</a></li>
          <li><a href="#terms-10">10. Forums and Discussion Areas</a></li>
          <li><a href="#terms-11">11. Promotions</a></li>
          <li><a href="#terms-12">12. Advertising and Third Parties</a></li>
          <li><a href="#terms-13">13. Beta Tests</a></li>
          <li><a href="#terms-14">14. Liability and Warranty Disclaimer</a></li>
          <li><a href="#terms-15">15. Indemnification</a></li>
          <li><a href="#terms-16">16. Termination</a></li>
          <li><a href="#terms-17">17. Updates to Services and Terms</a></li>
          <li><a href="#terms-18">18. Privacy Policy</a></li>
          <li><a href="#terms-19">19. Virtual Items and Currency</a></li>
          <li><a href="#terms-20">20. Applicable Law and Dispute Resolution</a></li>
          <li><a href="#terms-21">21. Health and Safety</a></li>
          <li><a href="#terms-22">22. Software and Tools</a></li>
          <li><a href="#terms-23">23. Mobile Terms</a></li>
          <li><a href="#terms-24">24. California Notice</a></li>
          <li><a href="#terms-25">25. Miscellaneous</a></li>
        </ol>

        <section className="legal-section" id="terms-1">
          <h2>1. Description of Services and Limited License</h2>
          <p>
            DTM provides Services for personal, non-commercial use. Subject to these
            Terms, you receive a limited, non-exclusive, non-transferable license to
            access and use those Services.
          </p>
        </section>

        <section className="legal-section" id="terms-2">
          <h2>2. Account</h2>
          <p>
            Some Services require account creation. You must provide accurate
            information, keep it current, and protect your account credentials.
          </p>
        </section>

        <section className="legal-section" id="terms-3">
          <h2>3. Use of Services and Rules of Conduct</h2>
          <p>
            You agree not to misuse the Services through unlawful conduct,
            harassment, cheating tools, hacking, spam, impersonation, or other
            disruptive or abusive behavior.
          </p>
        </section>

        <section className="legal-section" id="terms-4">
          <h2>4. Terms Specific to Minors</h2>
          <p>
            If you are a minor, use of the Services requires parent or legal guardian
            authorization and supervision as applicable by law.
          </p>
        </section>

        <section className="legal-section" id="terms-5">
          <h2>5. Intellectual Property Rights</h2>
          <p>
            Service content, including text, artwork, logos, marks, and software, is
            owned by DTM or its licensors and protected by intellectual property
            laws.
          </p>
        </section>

        <section className="legal-section" id="terms-6">
          <h2>6. User Generated Content</h2>
          <p>
            You remain responsible for content you submit. By posting UGC, you grant
            DTM broad rights to host, display, reproduce, adapt, and distribute it in
            connection with the Services.
          </p>
        </section>

        <section className="legal-section" id="terms-7">
          <h2>7. Reporting Unlawful Content</h2>
          <p>
            You may report content believed to be unlawful or in violation of these
            Terms. DTM may remove or disable content at its discretion.
          </p>
        </section>

        <section className="legal-section" id="terms-8">
          <h2>8. Technical Protection and DRM</h2>
          <p>
            Certain features may require DRM, online authentication, or persistent
            connectivity. DTM may modify or retire online features with notice when
            required.
          </p>
        </section>

        <section className="legal-section" id="terms-9">
          <h2>9. Merchant Services</h2>
          <p>
            Purchases offered through DTM stores or partners may be subject to
            additional sale and payment terms.
          </p>
        </section>

        <section className="legal-section" id="terms-10">
          <h2>10. Forums and Discussion Areas</h2>
          <p>
            Forum and social areas may be public. You are responsible for what you
            post, and DTM may moderate or remove violating content.
          </p>
        </section>

        <section className="legal-section" id="terms-11">
          <h2>11. Promotions</h2>
          <p>
            Sweepstakes, contests, and similar activities may include additional
            rules that apply in addition to these Terms.
          </p>
        </section>

        <section className="legal-section" id="terms-12">
          <h2>12. Advertising and Third Parties</h2>
          <p>
            Links and promotions to third-party websites or services are provided for
            convenience. DTM is not responsible for third-party content,
            transactions, or policies.
          </p>
        </section>

        <section className="legal-section" id="terms-13">
          <h2>13. Beta Tests</h2>
          <p>
            Beta features are provided as-is and may be confidential, unstable, or
            changed without notice.
          </p>
        </section>

        <section className="legal-section" id="terms-14">
          <h2>14. Liability and Warranty Disclaimer</h2>
          <p>
            Services are provided as-is and as-available, without warranties to the
            fullest extent permitted by law. Liability limitations apply as described
            in the full legacy terms.
          </p>
        </section>

        <section className="legal-section" id="terms-15">
          <h2>15. Indemnification</h2>
          <p>
            You agree to indemnify DTM and its affiliates for claims and losses
            resulting from your breach of these Terms or misuse of the Services.
          </p>
        </section>

        <section className="legal-section" id="terms-16">
          <h2>16. Termination</h2>
          <p>
            DTM may suspend or terminate access for violations or for other reasons
            permitted by law. You may also request account termination.
          </p>
        </section>

        <section className="legal-section" id="terms-17">
          <h2>17. Updates to Services and Terms</h2>
          <p>
            DTM may revise these Terms and the Services over time. Continued use
            after updates means acceptance of the revised terms.
          </p>
        </section>

        <section className="legal-section" id="terms-18">
          <h2>18. Privacy Policy</h2>
          <p>
            Your use of the Services is also governed by the Privacy Policy, which is
            incorporated into these Terms.
          </p>
        </section>

        <section className="legal-section" id="terms-19">
          <h2>19. Virtual Items and Currency</h2>
          <p>
            Virtual currency, points, subscriptions, and digital items may be offered
            under additional terms and are generally non-refundable unless required by
            law.
          </p>
        </section>

        <section className="legal-section" id="terms-20">
          <h2>20. Applicable Law and Dispute Resolution</h2>
          <p>
            Disputes are governed by applicable U.S./California law and may be
            subject to notice and arbitration procedures described in the legacy
            terms.
          </p>
        </section>

        <section className="legal-section" id="terms-21">
          <h2>21. Health and Safety</h2>
          <p>
            Play responsibly, take regular breaks, and stop use immediately if you
            experience concerning physical symptoms.
          </p>
        </section>

        <section className="legal-section" id="terms-22">
          <h2>22. Software and Tools</h2>
          <p>
            DTM may provide updates, utilities, and tools needed for Service use.
            Compatibility may vary by device, OS, and network conditions.
          </p>
        </section>

        <section className="legal-section" id="terms-23">
          <h2>23. Mobile Terms</h2>
          <p>
            Mobile access may require a compatible device, data plan, and bill-payer
            permission for purchases.
          </p>
        </section>

        <section className="legal-section" id="terms-24">
          <h2>24. California Notice</h2>
          <p>
            California residents may use the consumer assistance channels listed in
            the legacy terms.
          </p>
        </section>

        <section className="legal-section" id="terms-25">
          <h2>25. Miscellaneous</h2>
          <p>
            If any provision is unenforceable, remaining provisions stay in effect.
            These Terms and incorporated policies form the full agreement governing
            your use of the Services.
          </p>
          <p>
            Legacy source:{' '}
            <a href="https://beercheer.wpengine.com/terms-of-use/" target="_blank" rel="noreferrer">
              beercheer.wpengine.com/terms-of-use
            </a>
          </p>
        </section>
      </div>
      <SiteFooter />
    </div>
  )
}

function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 3

  useEffect(() => {
    let cancelled = false

    async function loadPosts() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(apiUrl('/api/blog-posts'))
        if (!response.ok) {
          throw new Error('Failed to load posts')
        }

        const data = await parseJsonSafe(response)
        if (!cancelled) {
          setPosts(Array.isArray(data.posts) ? data.posts : [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load posts')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPosts()
    return () => {
      cancelled = true
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * postsPerPage
  const visiblePosts = posts.slice(startIndex, startIndex + postsPerPage)

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage)
    }
  }, [currentPage, safePage])

  return (
    <div className="legal-page">
      <div className="legal-inner">
        <Link to="/" className="legal-logo-link" aria-label="Back to Beer Cheer home">
          <img
            src="/legacy/images/beer-cheer-logo-no-gear.png"
            alt="Beer Cheer"
            className="legal-logo"
          />
        </Link>

        <div className="blog-header">
          <h1>Beer Cheer Blog</h1>
          <Link to="/admin/login" className="blog-admin-link">Admin Login</Link>
        </div>

        {loading && <p>Loading posts...</p>}
        {error && <p className="blog-error">{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p>No blog posts yet. Check back soon.</p>
        )}

        {!loading && !error && visiblePosts.map((post) => (
          <article key={post.id} className="blog-card">
            <h2 dangerouslySetInnerHTML={{ __html: toRenderableHtml(post.title) }} />
            <p className="blog-date">Published {formatPublishDate(post.publishedAt)}</p>
            {post.excerpt && (
              <div
                className="blog-excerpt"
                dangerouslySetInnerHTML={{ __html: toRenderableHtml(post.excerpt) }}
              />
            )}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: toRenderableHtml(post.content) }}
            />
          </article>
        ))}

        {!loading && !error && posts.length > postsPerPage && (
          <nav className="blog-pagination" aria-label="Blog pagination">
            <button
              type="button"
              className="blog-btn blog-btn-muted"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              Previous
            </button>
            <span className="blog-page-indicator">Page {safePage} of {totalPages}</span>
            <button
              type="button"
              className="blog-btn blog-btn-muted"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next
            </button>
          </nav>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}

function AdminTopMenu({ showLogout = false }) {
  function handleTopbarLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    window.location.href = '/admin/login'
  }

  return (
    <header className="admin-topbar" role="banner">
      <div className="admin-topbar-inner">
        <div className="admin-topbar-left">
          <Link to="/admin" className="admin-topbar-brand" aria-label="Go to admin dashboard">
            Beer Cheer Admin
          </Link>
          <Link to="/admin/blogs" className="admin-topbar-link">
            Blogs
          </Link>
        </div>
        {showLogout ? (
          <button type="button" className="blog-btn admin-topbar-login" onClick={handleTopbarLogout}>
            Logout
          </button>
        ) : (
          <Link to="/admin/login" className="blog-btn admin-topbar-login">
            Login
          </Link>
        )}
      </div>
    </header>
  )
}

function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(apiUrl('/api/auth-login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await parseJsonSafe(response)

      if (!response.ok) {
        throw new Error(getLoginErrorMessage(response, data))
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      setMessage('Login successful. You can now create blog posts.')
      setTimeout(() => {
        window.location.href = '/admin'
      }, 400)
    } catch (err) {
      setError(getLoginErrorMessage(null, null, err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="legal-page">
      <AdminTopMenu />
      <div className="legal-inner blog-auth-wrap">
        <div className="blog-auth-panel">
          <Link to="/" className="legal-logo-link" aria-label="Back to Beer Cheer home">
            <img
              src="/legacy/images/beer-cheer-logo-no-gear.png"
              alt="Beer Cheer"
              className="legal-logo"
            />
          </Link>

          <h1>Admin Login</h1>
          <p>Use your admin credentials to create and publish blog posts.</p>

          <form className="blog-auth-form" onSubmit={handleSubmit}>
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button type="submit" className="blog-btn" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {message && <p className="blog-success">{message}</p>}
          {error && <p className="blog-error">{error}</p>}
          <p className="blog-back-link-row">
            <Link to="/blog">Back to Blog</Link>
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

function AdminEditorPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (!token) {
        if (!cancelled) {
          setAuthChecked(true)
          setIsAuthed(false)
        }
        return
      }

      try {
        const response = await fetch(apiUrl('/api/auth-me'), {
          headers: {
            'x-admin-token': token,
          },
        })

        if (!cancelled) {
          setIsAuthed(response.ok)
          setAuthChecked(true)
        }
      } catch {
        if (!cancelled) {
          setIsAuthed(false)
          setAuthChecked(true)
        }
      }
    }

    checkAuth()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (!token) {
        if (!cancelled) {
          setLoadingDashboard(false)
        }
        return
      }

      try {
        const response = await fetch(apiUrl('/api/blog-posts'), {
          headers: {
            'x-admin-token': token,
          },
        })
        const data = await parseJsonSafe(response)

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load dashboard data')
        }

        if (!cancelled) {
          setPosts(Array.isArray(data.posts) ? data.posts : [])
          setLoadingDashboard(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load dashboard data')
          setLoadingDashboard(false)
        }
      }
    }

    if (isAuthed) {
      loadDashboardData()
    }

    return () => {
      cancelled = true
    }
  }, [isAuthed])

  if (!authChecked) {
    return (
      <div className="legal-page">
        <div className="legal-inner">
          <h1>Admin</h1>
          <p>Checking session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="legal-page">
      <AdminTopMenu showLogout />
      <div className="legal-inner blog-auth-wrap">
        <div className="blog-auth-panel">
          <Link to="/" className="legal-logo-link" aria-label="Back to Beer Cheer home">
            <img
              src="/legacy/images/beer-cheer-logo-no-gear.png"
              alt="Beer Cheer"
              className="legal-logo"
            />
          </Link>

          <div className="admin-dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Review your blog activity and jump to management tools.</p>
          </div>

          {loadingDashboard && <p>Loading dashboard...</p>}
          {error && <p className="blog-error">{error}</p>}

          {!loadingDashboard && !error && (
            <div className="admin-dashboard-grid">
              <section className="admin-dashboard-card admin-dashboard-stat">
                <h2>Total Posts</h2>
                <p>{posts.length}</p>
              </section>

              <section className="admin-dashboard-card admin-dashboard-stat">
                <h2>Latest Publish</h2>
                <p>{posts[0]?.publishedAt ? formatPublishDate(posts[0].publishedAt) : 'No posts yet'}</p>
              </section>

              <section className="admin-dashboard-card admin-dashboard-actions-card">
                <h2>Blog Management</h2>
                <p>Browse, edit, and review all posts from a single list.</p>
                <Link to="/admin/blogs" className="admin-blogs-action admin-blogs-action-primary">
                  Open Blogs Dashboard
                </Link>
              </section>

              <section className="admin-dashboard-card admin-dashboard-actions-card">
                <h2>Public Site</h2>
                <p>Open the live blog feed and verify post formatting.</p>
                <Link to="/blog" className="admin-blogs-action admin-blogs-action-secondary">
                  View Public Blog
                </Link>
              </section>
            </div>
          )}

          <div className="blog-admin-actions">
            <Link to="/admin/blogs" className="blog-admin-link">Manage Blogs</Link>
          </div>

        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

function AdminBlogsPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedPostId, setExpandedPostId] = useState(null)
  const postsPerPage = 10

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (!token) {
        if (!cancelled) {
          setAuthChecked(true)
          setIsAuthed(false)
          setLoadingPosts(false)
        }
        return
      }

      try {
        const response = await fetch(apiUrl('/api/auth-me'), {
          headers: {
            'x-admin-token': token,
          },
        })

        if (!response.ok) {
          if (!cancelled) {
            setIsAuthed(false)
            setAuthChecked(true)
            setLoadingPosts(false)
          }
          return
        }

        const postsResponse = await fetch(apiUrl('/api/blog-posts'))
        const postsData = await parseJsonSafe(postsResponse)

        if (!postsResponse.ok) {
          throw new Error(postsData.message || 'Failed to load posts')
        }

        if (!cancelled) {
          const loadedPosts = Array.isArray(postsData.posts) ? postsData.posts : []
          setPosts(loadedPosts)
          setIsAuthed(true)
          setAuthChecked(true)
          setLoadingPosts(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load blog posts')
          setIsAuthed(true)
          setAuthChecked(true)
          setLoadingPosts(false)
        }
      }
    }

    checkAuth()
    return () => {
      cancelled = true
    }
  }, [])

  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * postsPerPage
  const visiblePosts = posts.slice(startIndex, startIndex + postsPerPage)

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage)
    }
  }, [currentPage, safePage])

  if (!authChecked) {
    return (
      <div className="legal-page">
        <div className="legal-inner">
          <h1>Admin Blogs</h1>
          <p>Checking session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="legal-page">
      <AdminTopMenu showLogout />
      <div className="legal-inner blog-auth-wrap">
        <div className="blog-auth-panel">
          <Link to="/" className="legal-logo-link" aria-label="Back to Beer Cheer home">
            <img
              src="/legacy/images/beer-cheer-logo-no-gear.png"
              alt="Beer Cheer"
              className="legal-logo"
            />
          </Link>

          <div className="admin-blogs-header">
            <div className="admin-blogs-header-copy">
              <h1>Admin Blogs</h1>
              <p>All blog posts are listed below. Click Edit to open the details page.</p>
            </div>
            <div className="admin-blogs-actions" aria-label="Admin blog actions">
              <Link to="/admin" className="admin-blogs-action admin-blogs-action-primary">
                Dashboard
              </Link>
              <Link to="/blog" className="admin-blogs-action admin-blogs-action-secondary">
                View Public Blog
              </Link>
            </div>
          </div>

          {loadingPosts && <p>Loading posts...</p>}
          {!loadingPosts && posts.length === 0 && !error && <p>No blog posts found.</p>}
          {error && <p className="blog-error">{error}</p>}

          {!loadingPosts && posts.length > 0 && (
            <div className="admin-blog-list">
              {visiblePosts.map((post) => {
                const isExpanded = expandedPostId === post.id

                return (
                <article key={post.id} className="admin-blog-list-item">
                  <div className="admin-blog-list-top">
                    <div className="admin-blog-list-heading">
                      <h2 className="admin-blog-list-title">{post.title || '(Untitled)'}</h2>
                      <p className="admin-blog-list-date">
                        Published {formatPublishDate(post.publishedAt)}
                      </p>
                    </div>
                    <div className="admin-blog-list-controls">
                      <Link
                        to={`/admin/blogs/${post.id}`}
                        className="blog-btn admin-edit-btn"
                        aria-label="Edit blog post"
                        title="Edit"
                      >
                        <span className="admin-edit-icon" aria-hidden="true">&#9998;</span>
                      </Link>
                      <button
                        type="button"
                        className="admin-caret-btn"
                        onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? 'Collapse post content' : 'Expand post content'}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <span className="admin-caret-icon" aria-hidden="true">
                          {isExpanded ? '▴' : '▾'}
                        </span>
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="admin-blog-list-copy">
                      {post.excerpt && (
                        <div
                          className="admin-blog-list-excerpt"
                          dangerouslySetInnerHTML={{ __html: toRenderableHtml(post.excerpt) }}
                        />
                      )}
                      {post.content && (
                        <div
                          className="blog-content admin-blog-list-content"
                          dangerouslySetInnerHTML={{ __html: toRenderableHtml(post.content) }}
                        />
                      )}
                    </div>
                  )}
                </article>
                )
              })}
            </div>
          )}

          {!loadingPosts && !error && posts.length > postsPerPage && (
            <nav className="blog-pagination" aria-label="Admin blog pagination">
              <button
                type="button"
                className="blog-btn blog-btn-muted"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Previous
              </button>
              <span className="blog-page-indicator">Page {safePage} of {totalPages}</span>
              <button
                type="button"
                className="blog-btn blog-btn-muted"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </nav>
          )}

        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

function AdminBlogDetailsPage() {
  const { postId } = useParams()
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editorReady, setEditorReady] = useState(false)
  const [editorError, setEditorError] = useState('')
  const editorHostRef = useRef(null)
  const quillRef = useRef(null)

  useEffect(() => {
    let disposed = false

    async function initEditor() {
      if (loadingPost) {
        return
      }

      if (!editorHostRef.current || quillRef.current) {
        return
      }

      try {
        await import('quill/dist/quill.js')

        if (disposed || !editorHostRef.current) {
          return
        }

        const Quill = window.Quill
        if (typeof Quill !== 'function') {
          throw new Error('Quill constructor is unavailable on window')
        }

        // React StrictMode can mount/unmount twice in dev; clear stale editor DOM before re-init.
        editorHostRef.current.innerHTML = ''

        const editor = new Quill(editorHostRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ header: [2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image', 'blockquote', 'code-block'],
              [{ align: [] }],
              ['clean'],
            ],
          },
        })

        editor.on('text-change', () => {
          setContent(editor.root.innerHTML)
        })

        quillRef.current = editor
        setEditorReady(true)
        setEditorError('')
      } catch (quillError) {
        console.error('Quill init failed', quillError)
        if (!disposed) {
          const message = String(quillError?.message || '')
          const details = message ? ` (${message})` : ''
          setEditorError(`HTML editor unavailable. Using plain textarea mode${details}.`)
        }
      }
    }

    initEditor()

    return () => {
      disposed = true
      quillRef.current = null
      setEditorReady(false)
    }
  }, [loadingPost])

  useEffect(() => {
    if (!editorReady || !quillRef.current) {
      return
    }

    const current = quillRef.current.root.innerHTML
    const next = content || ''
    if (current !== next) {
      try {
        quillRef.current.clipboard.dangerouslyPasteHTML(0, next, 'silent')
      } catch {
        quillRef.current.root.innerHTML = next
      }
    }
  }, [content, editorReady])

  useEffect(() => {
    let cancelled = false

    async function loadPostDetails() {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY)
      if (!token) {
        if (!cancelled) {
          setAuthChecked(true)
          setIsAuthed(false)
          setLoadingPost(false)
        }
        return
      }

      try {
        const authResponse = await fetch(apiUrl('/api/auth-me'), {
          headers: {
            'x-admin-token': token,
          },
        })

        if (!authResponse.ok) {
          if (!cancelled) {
            setAuthChecked(true)
            setIsAuthed(false)
            setLoadingPost(false)
          }
          return
        }

        const postsResponse = await fetch(apiUrl('/api/blog-posts'))
        const postsData = await parseJsonSafe(postsResponse)

        if (!postsResponse.ok) {
          throw new Error(postsData.message || 'Failed to load posts')
        }

        const loadedPosts = Array.isArray(postsData.posts) ? postsData.posts : []
        const selectedPost = loadedPosts.find((post) => post.id === postId)

        if (!selectedPost) {
          throw new Error('Blog post not found')
        }

        if (!cancelled) {
          setTitle(selectedPost.title || '')
          setExcerpt(selectedPost.excerpt || '')
          setContent(selectedPost.content || '')
          setAuthChecked(true)
          setIsAuthed(true)
          setLoadingPost(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load blog post')
          setAuthChecked(true)
          setIsAuthed(true)
          setLoadingPost(false)
        }
      }
    }

    loadPostDetails()
    return () => {
      cancelled = true
    }
  }, [postId])

  async function handleUpdatePost(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')

    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (!token) {
      setError('You are not logged in.')
      setSubmitting(false)
      return
    }

    if (!String(content || '').trim()) {
      setError('Content is required.')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch(apiUrl('/api/blog-update-post'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({
          id: postId,
          title,
          excerpt,
          content,
        }),
      })

      const data = await parseJsonSafe(response)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update post')
      }

      const updatedTitle = data.post?.title || title
      setMessage(`Post updated: ${updatedTitle}`)
    } catch (err) {
      setError(err.message || 'Failed to update post')
    } finally {
      setSubmitting(false)
    }
  }

  if (!authChecked) {
    return (
      <div className="legal-page">
        <div className="legal-inner">
          <h1>Edit Blog</h1>
          <p>Checking session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="legal-page">
      <AdminTopMenu showLogout />
      <div className="legal-inner blog-auth-wrap">
        <div className="blog-auth-panel">
          <Link to="/" className="legal-logo-link" aria-label="Back to Beer Cheer home">
            <img
              src="/legacy/images/beer-cheer-logo-no-gear.png"
              alt="Beer Cheer"
              className="legal-logo"
            />
          </Link>

          <h1>Edit Blog Post</h1>
          <p>Update the post details and save changes.</p>

          {loadingPost ? (
            <p>Loading post details...</p>
          ) : (
            <form className="blog-auth-form" onSubmit={handleUpdatePost}>
              <label htmlFor="update-post-title">Title</label>
              <input
                id="update-post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label htmlFor="update-post-excerpt">Excerpt (optional)</label>
              <input
                id="update-post-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />

              <label htmlFor="update-post-content">Content</label>
              {editorError ? (
                <textarea
                  id="update-post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                />
              ) : (
                <div className="admin-quill-wrap" id="update-post-content">
                  <div ref={editorHostRef} className="admin-quill-editor" />
                </div>
              )}
              {!editorError && !editorReady && <p className="admin-editor-note">Loading editor...</p>}
              {editorError && <p className="blog-error">{editorError}</p>}

              <button type="submit" className="blog-btn" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Blog'}
              </button>
            </form>
          )}

          {message && <p className="blog-success">{message}</p>}
          {error && <p className="blog-error">{error}</p>}
        </div>
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
          <Link to="/blog">Blog</Link> |{' '}
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
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminEditorPage />} />
        <Route path="/admin/blogs" element={<AdminBlogsPage />} />
        <Route path="/admin/blogs/:postId" element={<AdminBlogDetailsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
