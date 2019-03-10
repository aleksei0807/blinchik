import cookieParser from 'cookie'


const set = (cookie, cookies, headers) => {
  let { value, expires } = cookie
  const { name, isReplace, getValue, getExpires } = cookie

  if (isReplace || !cookies[name]) {
    if (typeof getValue === 'function') {
      value = getValue()
    }

    if (typeof getExpires === 'function') {
      expires = getValue()
    }

    headers.push(`Set-Cookie: sessid=${value}; Expires=${expires}`)
  }

  if (!isReplace && cookies[name]) {
    value = cookies[name]
  }

  return {
    ...cookie,
    value,
  }
}

const setCookie = (cookie) => (params) => {
  const { req } = params

  let cookies = {}
  if (req.headers.cookie) {
    cookies = cookieParser.parse(req.headers.cookie)
  }

  let resultCookie = cookie

  if (cookie instanceof Array) {
    resultCookie = cookie.map((c) => (
      set(c, cookies, params.headers)
    ))
  } else {
    resultCookie = set(cookie, cookies, params.headers)
  }

  return {
    headers: params.headers,
    req,
    cookie: resultCookie,
  }
}


export default setCookie
