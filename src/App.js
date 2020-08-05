require('dotenv').config()
const token = process.env.TOKEN
const Discord = require('discord.js')
const client = new Discord.Client()
const waitUsers =require('./WaitUsers')
const sourceCode = require('./SourceCode')

client.on('ready', () => {
  console.log('ready...')
})

client.on('message', (message) => {
  if (message.author.bot) 
    return
    
  const id = message.author.id
  const userName = message.author.username

  if (message.content === '!coder --help') {
    message.reply(
      '以下のプログラミング言語を使用できます。\n長すぎるとバグります。\n--reset:最初からやり直します．\n--hub:githubからコードを取得します。'
    )
    return
  }

  if (message.content === '!coder --reset') {
    waitUsers.deleteUser(id)
    return
  }

  if (message.content === '!coder --hub' && !waitUsers.hasUser(id)) {
    console.log('standby: ' + userName + '(id:' + id + ')')
    waitUsers.addUser({ id: id, useGitHub: true })
    message.reply('プログラミング言語の種類を送ってー')
    return
  }

  if (message.content === '!coder' && !waitUsers.hasUser(id)) {
    console.log('standby: ' + userName + '(id:' + id + ')')
    waitUsers.addUser({ id: id })
    message.reply('プログラミング言語の種類を送ってー')
    return
  }

  const userData = waitUsers.getUser(id)
  if (!userData) return

  if (!userData['lang']) {
    console.log('get lang: ' + userName + '(id:' + id + ')')
    userData.lang = message.content
    message.reply(
      '言語はOK\n次はコードを送ってー(GitHubを利用する場合はURL貼ってね！！)'
    )
    return
  }

  if (!userData['code']) {
    console.log('get code: ' + userName + '(id:' + id + ')')
    if (userData.useGitHub) console.log()
    else userData.code = message.content
    message.reply('コードOK\n次は入力を送ってー')
    return
  }

  if (!userData['input']) {
    console.log('get inputs: ' + userName + '(id:' + id + ')')
    message.reply('OKじっこーするよ\nちょっと待ってね！！')
    userData.input = message.content

    sourceCode.postCode(userData)
      .then((msg) => {
        console.log(msg.data)
        if (msg.data.error) {
          throw { id, userName, msg: msg.data.error }
        }
        setTimeout(function () {
          sourceCode.getResult(msg.data.id)
            .then((res) => {
              if (msg.data.error) {
                throw { id, userName, msg: msg.data.error }
              }
              if (res.data.status === 'running')
                throw { id, userName, msg: 'タイムアウト' }
              else if (res.data.exit_code === 1)
                throw { id, userName, msg: res.data.stderr }
              else {
                message.reply(res.data.stdout)
                console.log('complate ' + userName + '(id:' + id + ')')
              }
            })
            .catch((error) => {
              message.reply(error.msg)
              console.log(error.userName + '(id:' + error.id + ')')
              console.log(error.msg)
            })
        }, 1000)
      })
      .catch((error) => {
        message.reply(error.msg)
        console.log(error.userName + '(id:' + error.id + ')')
        console.log(error.msg)
      })
    waitUsers.deleteUser(id)
    return
  }
})
client.login(token)
