import * as pako from 'pako'

function generateUrl(url, opts) {
  if (!opts) {
    opts = {}
  }

  const params = optionsToImageParams(opts)
  if (params) {
    url = url + "?/" + params.join("/")
  }
  return url
}

function optionsToImageParams(opts) {
  let params = undefined

  for (const p of Object.keys(paramsMap)) {
    const v = opts[p]
    const k = paramsMap[p]
    if (v && v != "") {
      if (!params) params = []
      params.push(k + v.toString())
    }
  }
  return params && params.sort()
}

const paramsMap = {
  width: "w",
  height: "h"
}

export async function withDocument(resp, encoding) {

  if (resp.document) {
    // already done
    return resp
  }

  const contentType = resp.headers.get("content-type") || ""
  if (!contentType.includes("text/html")) {
    return resp
  }

  let body = await resp.text()

  resp = new Response(body, resp)
  resp.document = Document.parse(body)

  const selector = "img[src]"
  const images = resp.document.querySelectorAll(selector) 
  for (const img of images) {
    if (img.getAttribute('srcset')) {
      continue
    }
    const url = img.getAttribute("src")
    const srcSet = [
      `${generateUrl(url, { width: 600 })} 600w`,
      `${generateUrl(url, { width: 900 })} 900w`,
      `${generateUrl(url, { width: 1440 })} 1440w`
    ]
    img.setAttribute("srcset", srcSet.join(","))
    if (url.includes("@2x")) {
      img.replaceWith(pictureTemplate(img, url, img.outerHTML))
    }
  }
  body = resp.document.documentElement.outerHTML
  if (encoding && encoding.includes("gzip")) {
    body = pako.gzip(body).buffer
    resp.headers.set("content-encoding", "gzip")
  }
  resp.headers.delete("content-length")
  return resp
}
function pictureTemplate(img, url, imgHtml) {
  const html = `<picture>
            <source
              media="(min-width: 900px)"
              srcset="${generateUrl(url, { width: 1440 })} 1x, ${generateUrl(url, { width: 2880 })} 2x"
              type="image/webp" >
            <source
              media="(min-width: 600px)"
              srcset="${generateUrl(url, { width: 900 })} 1x, ${generateUrl(url, { width: 1800 })} 2x"
              type="image/webp" >
            <source
              srcset="${generateUrl(url, { width: 600 })} 1x, ${generateUrl(url, { width: 1200 })} 2x"
              type="image/webp" >
            ${imgHtml}
          </picture>`
  return html
}