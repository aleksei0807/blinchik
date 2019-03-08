const isNodeMethod = () => {
  let isNode = false
  if (typeof process === 'object') {
    if (typeof process.versions === 'object') {
      if (typeof process.versions.node !== 'undefined') {
        isNode = true
      }
    }
  }

  return isNode
}


export default isNodeMethod
