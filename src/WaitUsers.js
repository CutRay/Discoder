const waitUsers = []
module.exports = {
  addUser: function (user) {
    waitUsers.push(user)
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
}
