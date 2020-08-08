const waitUsers = require('../models/WaitUsers')
const paiza = require('../apis/Paiza')

module.exports = function (message) {
  const id = message.author.id
  const input = message.content
  const userData = waitUsers.getUser(id)

  console.log('input phase: ' + userData.name + '(id:' + userData.id + ')')
  waitUsers.setInput(userData.id, input)
  console.log(
    'complate input phase: ' + userData.name + '(id:' + userData.id + ')'
  )
  message.reply('OKじっこーするよ\nちょっと待ってね！！')
  console.log(userData)
  execCode(userData, message)
  waitUsers.deleteUser(userData.id)
  waitUsers.showAllUsers()
  return
}

function execCode(userData, message) {
  paiza
    .postCode(userData)
    .then((msg) => {
      if (msg.data.error) throw { ...userData, msg: msg.data.error }

      setTimeout(function () {
        paiza
          .getResult(msg.data.id)
          .then((res) => {
            if (msg.data.error) {
              throw { ...userData, msg: msg.data.error }
            }
            if (res.data.status === 'running')
              throw { ...userData, msg: 'タイムアウト' }
            else if (res.data.exit_code === 1)
              throw { ...userData, msg: res.data.stderr }
            else {
              message.reply('\n' + res.data.stdout)
              console.log(
                'complate exec phase: ' +
                  userData.name +
                  '(id:' +
                  userData.id +
                  ')'
              )
            }
          })
          .catch((error) => {
            message.reply('\n' + error.msg)
            console.log('code error: ' + error.name + '(id:' + error.id + ')')
            console.log(error.msg)
          })
      }, 3000)
    })
    .catch((error) => {
      message.reply('\n' + error.msg)
      console.log('post error: ' + error.name + '(id:' + error.id + ')')
      console.log(error)
    })
}
