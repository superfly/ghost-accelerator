import proxy from '@fly/proxy';
import { processImages } from './src/images';
import { withDocument } from './src/html';


const subdomain = "demo"
const ghost = proxy(`https://${subdomain}.ghost.io`,
  {
    headers: {
      'host': `${subdomain}.ghost.io`,
      'x-forwarded-host': false
    }
})

const imageWidths = {
  "site-header": {
    width: 1900,
    selector: ".site-header.outer"
  },
  "post-feed": {
    width: 320,
    selector: ".post-feed .post-card-image"
  }
}

fly.http.respondWith(
  // just wrap our router up in 
  // image processing middleware
  processImages(
    // writes images with sizes into html
    resizeGhostImages(ghost),
    {
      sizes: imageWidths // options for processImages
    }
  )
)

function resizeGhostImages(fetch) {
  return async function resizeGhostImages(req, opts) {
    let resp = await fetch(req, opts)
    if (req.headers.get("fly-html-rewrite") === "off") {
      return resp
    }

    resp = await withDocument(resp)
    if (!resp.document || !(resp.document instanceof Document)) {
      // nothing to do
      console.log("nothing to do")
      return resp
    }

    for (const k of Object.keys(imageWidths)) {
      const o = imageWidths[k]
      const elements = resp.document.querySelectorAll(o.selector)
      const append = '?' + k

      for (const el of elements) {
        let style = el.getAttribute('style')
        if (style) {
          // replace url(/blah.jpg.) in style attributes
          const nstyle = style.replace(/(url\(\/.+)(png|jpg|gif)\)/, `$1$2${append})`)
          if (nstyle != style) {
            el.setAttribute('style', nstyle)
          }
        }
      }
    }
    const html = resp.document.documentElement.outerHTML
    resp = new Response(html, resp)
    resp.headers.delete("content-length")
    return resp
  }
}
