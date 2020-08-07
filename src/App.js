require('dotenv').config()
const token = process.env.TOKEN
const Discord = require('discord.js')
const client = new Discord.Client()
const waitUsers = require('./WaitUsers')
const paiza = require('./Paiza')
const langs = require('./Langs.js')

client.on('ready', () => {
  console.log('ready...')
})

client.on('message', (message) => {
  if (message.author.bot) return

  const id = message.author.id
  const userName = message.author.username

  if (message.content === '!coder --help') {
    let msgContent =
      '\n(実行方法)\n!coder [言語] [オプション]\n\n(オプション)\n--reset: 最初からやり直します。\n--hub: githubからコードを取得します。\n\n(対応言語)\n長すぎるとバグります。'
    langs.all().map((el) => (msgContent += `\n${el.name} [${el.ops}]`))
    console.log(msgContent)
    message.reply(msgContent)
    return
  }

  if (message.content === '!coder --reset') {
    waitUsers.deleteUser(id)
    waitUsers.showAllUsers()
    return
  }

  //待機中のユーザを作成(idとuserNameとmsgContent)
  const msgContent = message.content.split(' ')
  if (msgContent[0] === '!coder' && !waitUsers.hasUser(id)) {
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
      return
    }
    waitUsers.addUser({ id, name: userName, lang })
    waitUsers.showAllUsers()
    message.reply(
      'OK\n次はコードを送ってー(GitHubを利用する場合はURL貼ってね！！)'
    )
    return
  }

  const userData = waitUsers.getUser(id)
  if (!userData) return

  //コードを入力させる(idとcode)
  if (!userData['code']) {
    console.log('get code: ' + userName + '(id:' + id + ')')
    let code = message.content
    if (userData.useGitHub) console.log()
    else {
      if (code.substr(0, 3) === '```' && code.substr(-3) === '```')
        code = code.slice(3).slice(0, -3)
      waitUsers.setCode(id, code)
    }
    message.reply('コードOK\n次は入力を送ってー')
    return
  }

  //引数を入力させる
  if (!userData['input']) {
    const input = message.content
    waitUsers.setInput(id, input)
    console.log('get inputs: ' + userName + '(id:' + id + ')')
    message.reply('OKじっこーするよ\nちょっと待ってね！！')
    execCode(userData, message)
    waitUsers.deleteUser(id)
    waitUsers.showAllUsers()
    return
  }
})
client.login(token)

function execCode(userData, message) {
  paiza
    .postCode(userData)
    .then((msg) => {
      if (msg.data.error) {
        throw { userData, msg: msg.data.error }
      }
      setTimeout(function () {
        paiza
          .getResult(msg.data.id)
          .then((res) => {
            if (msg.data.error) {
              throw { userData, msg: msg.data.error }
            }
            if (res.data.status === 'running')
              throw { userData, msg: 'タイムアウト' }
            else if (res.data.exit_code === 1)
              throw { userData, msg: res.data.stderr }
            else {
              message.reply('\n' + res.data.stdout)
              console.log(
                'complate ' + userData.name + '(id:' + userData.id + ')'
              )
            }
          })
          .catch((error) => {
            message.reply('\n' + error.msg)
            console.log(error.userData.name + '(id:' + error.userData.id + ')')
            console.log(error.msg)
          })
      }, 3000)
    })
    .catch((error) => {
      message.reply('\n' + error.msg)
      console.log(error.userData.name + '(id:' + error.userData.id + ')')
      console.log(error.msg)
    })
}
