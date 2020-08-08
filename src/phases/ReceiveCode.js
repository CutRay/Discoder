const waitUsers = require('../models/WaitUsers')
const gitHub = require('../apis/GitHub')
module.exports = async function (message) {
  const id = message.author.id
  const userData = waitUsers.getUser(id)

  const { name, useGitHub } = userData

  console.log('code phase: ' + name + '(id:' + id + ')')
  if (useGitHub) {
    const code = await gitHub.getCode(message.content)
    if (code) waitUsers.setCode(id, code)
    else {
      message.reply('コードを取得できなかったよー\n')
      waitUsers.deleteUser(id)
      waitUsers.showAllUsers()
      console.log('failed code phase: ' + name + '(id:' + id + ')')
      return
    }
  } else {
    let code = message.content
    if (code.substr(0, 3) === '```' && code.substr(-3) === '```')
      code = code.slice(3).slice(0, -3)
    waitUsers.setCode(id, code)
  }
  message.reply('コードOK\n次は入力を送ってー')
  console.log('complate code phase: ' + name + '(id:' + id + ')')
  return
}
