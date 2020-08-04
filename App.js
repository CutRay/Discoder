const Discord = require('discord.js')
const axios = require('axios')
require('dotenv').config()
const client = new Discord.Client()
const token = process.env.TOKEN
const waitCodeUsers = []

client.on('ready', () => {
  console.log('ready...')
})

client.on('message', message => {
  if (message.author.bot) {
    return
  }
  const authorId = message.author.id
  if (
    message.content === '!coder' &&
    !waitCodeUsers.some(el => el.id === authorId)
  ) {
    console.log('standby:' + authorId)
    waitCodeUsers.push({ id: authorId })
    message.reply('プログラミング言語の種類を送ってー')
    return
  }

  const userData = waitCodeUsers.find(el => el.id === authorId)
  if (!userData) return
  if (message.content === '!coder --help') {
    message.reply(
      '以下のプログラミング言語を使用できます。\n長すぎるとバグります。'
    )
    return
  }
  if (message.content === '!coder --reset') {
    delUserIndex = waitCodeUsers.findIndex(el => el.id === authorId)
    waitCodeUsers.splice(delUserIndex, 1)
    return
  }
  if (!userData['lang']) {
    console.log('get lang:' + authorId)
    userData.lang = message.content
    message.reply('言語はOK\n次はコードを送ってー')
    return
  }
  if (!userData['code']) {
    console.log('get code:' + authorId)
    userData.code = message.content
    message.reply('コードOK\n次は入力を送ってー')
    return
  }
  if (!userData['input']) {
    console.log('get inputs:' + authorId)
    message.reply('OKじっこーするよ\nちょっと待ってね！！')
    userData.input = message.content

    postCode(userData)
      .then(msg => {
        setTimeout(function() {
          getResult(msg.data.id)
            .then(res => {
              message.reply(res.data.stdout)
              console.log('complate' + authorId)
            })
            .catch(error => {
              console.log('get result error' + authorId)
              console.log(error)
            })
        }, 1000)
      })
      .catch(error => {
        console.log('post code error')
        console.log(error)
      })

    delUserIndex = waitCodeUsers.findIndex(el => el.id === authorId)
    waitCodeUsers.splice(delUserIndex, 1)

    return
  }
})
client.login(token)

async function postCode(data) {
  const url = 'http://api.paiza.io:80/runners/create'
  return await axios.post(url, {
    source_code: data.code,
    language: data.lang,
    input: data.input,
    api_key: 'guest'
  })
}

async function getResult(id) {
  const url = 'http://api.paiza.io:80/runners/get_details'
  return await axios.get(url, {
    params: {
      id: id,
      api_key: 'guest'
    }
  })
}
