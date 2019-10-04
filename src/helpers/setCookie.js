/* @flow */
// Copyright 2019-present Aleksei Shchurak
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//


import cookieParser from 'cookie'


type CookieObject = {
  value?: string;
  expires?: string | Date;
  name?: string;
  isReplace?: boolean;
  ttl?: number;
  getValue?: () => string;
  getExpires?: () => string | Date;
}

type Params = {
  req: {
    headers: {
      cookie?: string;
    }
  };
  headers: Array<string>;
}


const set = (cookie, cookies, headers) => {
  let { value, expires } = cookie
  const { name, isReplace, getValue, getExpires, ttl } = cookie

  if (isReplace || !name || !cookies[name]) {
    if (typeof getValue === 'function') {
      value = getValue()
    }

    if (ttl) {
      expires = new Date(Date.now() + ttl * 1000)
    } else if (typeof getExpires === 'function') {
      expires = getExpires()
    }

    if (!expires) {
      expires = new Date()
      expires.setDate(expires.getDate() + 1)
    }

    if (expires instanceof Date) {
      expires = expires.toUTCString()
    }

    if (value) {
      headers.push(`Set-Cookie: sessid=${value}; Expires=${expires}`)
    }
  }

  if (!isReplace && name && cookies[name]) {
    value = cookies[name]
  }

  return {
    ...cookie,
    value,
  }
}

const setCookie = (cookie: CookieObject | Array<CookieObject>) => (params: Params) => {
  const { req } = params

  let cookies = {}
  if (req.headers.cookie) {
    cookies = cookieParser.parse(req.headers.cookie)
  }

  let resultCookie = cookie

  if (cookie instanceof Array) {
    resultCookie = cookie.map<CookieObject>((c) => (
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
