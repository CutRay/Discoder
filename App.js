const Discord = require('discord.js')
const axios = require('axios')
require('dotenv').config()
const client = new Discord.Client()
const token = process.env.TOKEN
const waitUsers = []

client.on('ready', () => {
  console.log('ready...')
})

client.on('message', (message) => {
  if (message.author.bot) {
    return
  }
  const id = message.author.id
  const userName = message.author.username

  if (message.content === '!coder --help') {
    message.reply(
      '以下のプログラミング言語を使用できます。\n長すぎるとバグります。\n--reset:最初からやり直します．\n--hub:githubからコードを取得します。'
    )
    return
  }

  if (message.content === '!coder --reset') {
    deleteUser(id)
    return
  }

  if (
    message.content === '!coder --hub' &&
    !waitUsers.some((el) => el.id === id)
  ) {
    console.log('standby: ' + userName + '(id:' + id + ')')
    waitUsers.push({ id: id, useGitHub: true })
    message.reply('プログラミング言語の種類を送ってー')
    return
  }

  if (message.content === '!coder' && !waitUsers.some((el) => el.id === id)) {
    console.log('standby: ' + userName + '(id:' + id + ')')
    waitUsers.push({ id: id })
    message.reply('プログラミング言語の種類を送ってー')
    return
  }

  const userData = getUser(id)
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

    postCode(userData)
      .then((msg) => {
        console.log(msg.data)
        if (msg.data.error) {
          throw { id, userName, msg: msg.data.error }
        }
        setTimeout(function () {
          getResult(msg.data.id)
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
    deleteUser(id)
    return
  }
})
client.login(token)

function getUser(id) {
  return waitUsers.find((el) => el.id === id)
}

function deleteUser(id) {
  const delUserIndex = waitUsers.findIndex((el) => el.id === id)
  waitUsers.splice(delUserIndex, 1)
}

async function postCode(data) {
  const url = 'http://api.paiza.io:80/runners/create'
  return await axios.post(url, {
    source_code: data.code,
    language: data.lang,
    input: data.input,
    api_key: 'guest',
  })
}

async function getResult(id) {
  const url = 'http://api.paiza.io:80/runners/get_details'
  return await axios.get(url, {
    params: {
      id: id,
      api_key: 'guest',
    },
  })
}
