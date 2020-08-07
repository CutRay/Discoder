const waitUsers = require('../models/WaitUsers')
const langs = require('../models/Langs.js')
module.exports = function (ops, message) {
  const id = message.author.id
  switch (ops) {
    case '--reset':
      resetPhase(id)
      break
    case '--help':
      showHelp(message)
      break
  }
  return
}

function showHelp(message) {
  let msgContent =
    '\n(実行方法)\n!coder [言語] [オプション]\n\n(オプション)\n--reset: 最初からやり直します。\n--hub: githubからコードを取得します。\n\n(対応言語)\n長すぎるとバグります。'
  langs.all().map((el) => (msgContent += `\n${el.name} [${el.ops}]`))
  message.reply(msgContent)
  return
}

function resetPhase(id) {
  waitUsers.deleteUser(id)
  waitUsers.showAllUsers()
}
