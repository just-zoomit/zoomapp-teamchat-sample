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
  req.appUser = appUser

  const response = await zoomApi.sendAChatMessage(appUser.accessToken, req.body)

} catch (error) {
  return next(new Error('Error sending chat message ', error))
}

}, // Add this
async sendAChatCommand(req, res, next) {
  console.log('SEND A CHAT COMMAND HANDLER');
  const { userId, cmd: command } = req.body.payload;
  if (!command) {
    return res.status(200).send();
  }

  const [from, to] = command.split(',').map(date => date.trim());
  console.log("Processing command:", command, "From:", from, "To:", to);

  if (req.headers.authorization !== process.env.zoom_verification_token) {
    return res.status(401).send(`/${command} api -- Unauthorized request to Zoom Chatbot.`);
  }

  try {
    const appUser = await store.getUser(userId);
    const chatbotToken = await zoomApi.getChatbotToken();
    const recordings = await zoomApi.getZoomRecordings(appUser.accessToken, from, to);
    const chatBody = zoomApi.generateChatBody(recordings, req.body.payload);

    await zoomApi.sendIMChat(chatBody, chatbotToken);
    res.status(200).send();
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send(`/${command} api -- Internal Server Error`);
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
