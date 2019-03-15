// borrowed and refactored version of https://stackoverflow.com/a/24048615

const isArrayLike = (item) => (
  Array.isArray(item)
  || (!!item
    && typeof item === 'object'
    && Object.prototype.hasOwnProperty.call(item, 'length')
    && typeof item.length === 'number'
    && item.length > 0
    && (item.length - 1) in item
  )
)

export default isArrayLike
