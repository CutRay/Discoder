const waitUsers = require('../models/WaitUsers')
module.exports = function (message) {
  const id = message.author.id
  const userData = waitUsers.getUser(id)

  const { name, useGitHub } = userData
  let code = message.content
  console.log('get code: ' + name + '(id:' + id + ')')
  if (useGitHub) console.log()
  else {
    if (code.substr(0, 3) === '```' && code.substr(-3) === '```')
      code = code.slice(3).slice(0, -3)
    waitUsers.setCode(id, code)
  }
  message.reply('コードOK\n次は入力を送ってー')
  return
}
