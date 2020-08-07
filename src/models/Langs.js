const langs = require('../db/langs.json').langs
module.exports = {
  hasLang(ops) {
    return langs.some((el) => el.ops === ops)
  },
  getLang: function (index) {
    return langs[index]
  },
  all() {
    return langs
  },
}
