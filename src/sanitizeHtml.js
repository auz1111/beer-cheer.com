import DOMPurify from 'dompurify'

// Embeds allowed in post HTML: YouTube videos and Amazon Kindle preview cards. Any other iframe is dropped.
const ALLOWED_IFRAME_SRC = [
  /^https:\/\/www\.(youtube-nocookie|youtube)\.com\/embed\//,
  /^https:\/\/read\.amazon\.com\/kp\/card\?/,
]

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') {
    return
  }
  const src = node.getAttribute('src') || ''
  if (!ALLOWED_IFRAME_SRC.some((pattern) => pattern.test(src))) {
    node.remove()
  }
})

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

// Post HTML comes from the admin editor and imported WordPress content; strip scripts, event
// handlers and javascript: URLs before it reaches dangerouslySetInnerHTML.
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading', 'sandbox', 'target'],
  })
}
