const generateRandomString = function(length) {
  let randomString = ''
  const possibleCharacters = 'qwertyuiopasdfghjklñzxcvbnmQWERTYUIOPASDFGHJKLÑZXCVBNM1234567890'

  for (var i = 0; i < length; i++) {
    randomString + possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
  }
  return randomString
}

module.exports = generateRandomString
