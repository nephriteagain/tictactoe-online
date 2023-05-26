

export function randomId() {
  let i = 0
  let str = ''
  while (i < 8) {    
    let random = Math.random() * 9
    random = Math.round(random)

    str = str.concat(random.toString())
    i++
  }

  return str
}

export function getId() {
  const hasId = localStorage.getItem('tttId')
  if (hasId) {
    return hasId
  } else {
    const newId = randomId()
    localStorage.setItem('tttId', newId)
    return newId
  }
}