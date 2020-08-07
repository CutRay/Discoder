const axios = require('axios')
const url = 'http://api.paiza.io:80/runners'
module.exports = {
  postCode: async function (data) {
    return await axios.post(url + '/create', {
      source_code: data.code,
      language: data.lang,
      input: data.input,
      api_key: 'guest',
    })
  },
  getResult: async function (id) {
    return await axios.get(url + '/get_details', {
      params: {
        id: id,
        api_key: 'guest',
      },
    })
  },
}
