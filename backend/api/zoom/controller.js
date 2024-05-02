const { createProxyMiddleware } = require('http-proxy-middleware')
const zoomApi = require('../../util/zoom-api')
const store = require('../../util/store')

module.exports = {

// Send a Chat Message
async sendAChatMessage(req, res, next) {
  try {
  console.log('SEND A CHAT MESSAGE HANDLER ==========================================================', '\n')


  const users = req?.session?.user

  if (!users) {
    return next(new Error('No session or no user. You may need to close and reload or reinstall the application'))
  }

  const appUser = await store.getUser(users)


  // console.log('App User: ', appUser)

 //Problematic request, when uncommented, the app crashes, not able use getUser 
  const response = await zoomApi.sendAChatMessage(appUser.accessToken, req.body)

} catch (error) {
  return next(new Error('Error sending chat message ', error))
}

},

  // Proxy requests to the Zoom REST API
  proxy: createProxyMiddleware({
    target: process.env.ZOOM_HOST,
    changeOrigin: true,
    pathRewrite: {
      '^/zoom/api': '',
    },

    onProxyRes: function (proxyRes, req, res) {
      console.log(
        'ZOOM API PROXY ==============================================',
        '\n'
      )

      var body = []
      proxyRes
        .on('error', (err) => {
          console.error(err)
        })
        .on('data', (chunk) => {
          body.push(chunk)
        })
        .on('end', () => {
          body = Buffer.concat(body).toString()
          // At this point, we have the headers, method, url and body, and can now
          // do whatever we need to in order to respond to this request.
          console.log(
            `Zoom API Proxy => ${req.method} ${req.path} -> [${proxyRes.statusCode}] ${body}`
          )

          res.end()
        })
    },
  }),



}
