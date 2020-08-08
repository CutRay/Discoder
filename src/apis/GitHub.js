const axios = require('axios')
require('dotenv').config()
module.exports = {
  getCode: async function (url) {
    const parsedURL = url.match(/https:\/\/github.com\/(.*)\/blob\/(.*)/)
    const repo = parsedURL[1]
    const contents = parsedURL[2]
    return await axios
      .get(`${encodeURI(`https://api.github.com/repos/${repo}/branches`)}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      })
      .then((el) => {
        const branches = []
        el.data.map((el) => {
          branches.push(el.name)
        })
        const matchedBranch = branches.filter(
          (branch) => url.indexOf(branch) >= 0
        )[0]
        const parsedContents = contents.match(matchedBranch + '(.*)')[1]
        return { contents: parsedContents, branches: matchedBranch }
      })
      .then(async ({ contents, branches }) => {
        return await axios.get(
          `${encodeURI(
            `https://api.github.com/repos/${repo}/contents/${contents}`
          )}`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              authorization: `token ${process.env.GITHUB}`,
            },
            params: { ref: branches },
          }
        )
      })
      .then((response) => {
        const decodedContent = Buffer.from(
          response.data.content,
          'base64'
        ).toString()

        return decodedContent
      })
      .catch(() => {
        console.log('コードを取得できませんでした')
        return false
      })
  },
}
