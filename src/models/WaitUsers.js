const waitUsers = []
module.exports = {
  addUser: function (user) {
    waitUsers.push({ ...user, phase: 'code' })
  },
  hasUser(id) {
    return waitUsers.some((el) => el.id === id)
  },
  getUser: function (id) {
    return waitUsers.find((el) => el.id === id)
  },
  deleteUser: function (id) {
    const delUserIndex = waitUsers.findIndex((el) => el.id === id)
    waitUsers.splice(delUserIndex, 1)
  },
  showAllUsers: function () {
    console.log('waitUsers >')
    console.log(waitUsers)
  },
  setCode: function (id, code) {
    const user = this.getUser(id)
    user.code = code
    user.phase = 'input'
  },
  setInput: function (id, input) {
    const user = this.getUser(id)
    user.input = input
    user.phase = 'exec'
  },
  getUserPhase: function (id) {
    const user = this.getUser(id)
    return user ? user.phase : -1
  },
}
