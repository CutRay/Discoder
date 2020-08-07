const waitUsers = require('../models/WaitUsers')
const langs = require('../models/Langs.js')
module.exports = function ({ id, name }, message) {
  if (waitUsers.hasUser(id)) return
  const msgContent = message.content.split(' ')
  const lang = msgContent[1]
  if (!msgContent[1]) {
    message.reply('言語指定してください笑')
    return
  }
  if (!langs.hasLang(lang)) {
    message.reply('対応していない言語ですよー笑')
    return
  }
  if (msgContent[2] && msgContent[2] === '--hub') {
    waitUsers.addUser({ ...{ id, name, useGitHub: true }, lang })
    return
  } else {
    waitUsers.addUser({ ...{ id, name }, lang })
  }

  waitUsers.showAllUsers()
  message.reply(
    'OK\n次はコードを送ってー(GitHubを利用する場合はURL貼ってね！！)'
  )
  return
}
