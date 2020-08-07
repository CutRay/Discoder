require('dotenv').config()
const token = process.env.TOKEN
const Discord = require('discord.js')
const client = new Discord.Client()
const createWaitUsers = require('./phases/CreateWaitUsers')
const receiveCode = require('./phases/ReceiveCode')
const receiveInput = require('./phases/ReceiveInput')
const showOptions = require('./phases/Options')
const waitUsers = require('./models/WaitUsers')

client.on('ready', () => {
  console.log('ready...')
})

client.on('message', (message) => {
  if (message.author.bot) return

  const id = message.author.id
  const userName = message.author.username

  if (message.content === '!coder --reset') {
    showOptions('--reset', message)
    return
  }

  if (message.content === '!coder --help') {
    showOptions('--help', message)
    return
  }

  //待機中のユーザを作成
  const msgContent = message.content.split(' ')
  if (msgContent[0] === '!coder') {
    createWaitUsers({ id, name: userName }, message)
    return
  }

  const userPhase = waitUsers.getUserPhase(id)
  if (!userPhase) return

  //コードを入力させる
  if (userPhase == 'code') {
    receiveCode(message)
    return
  }
  //引数を入力させて実行する
  if (userPhase == 'input') {
    receiveInput(message)
    return
  }
})
client.login(token)
