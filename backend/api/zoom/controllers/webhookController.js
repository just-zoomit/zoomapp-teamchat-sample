
const { createProxyMiddleware } = require('http-proxy-middleware')
const crypto = require('crypto');
const zoomApi = require('../../../util/zoom-api')
const store = require('../../../util/store')
const controller = require('./controller')

module.exports = {

  async handleWebhook(req, res, next) {
    const { event, data } = req.body;

    console.log('Webhook Event:', req.body);
   
    if (!req.body) {
      return res.status(200).send();
    }
    if (req.headers.authorization !== process.env.zoom_verification_token) {
      return res.status(401).send(`Unauthorized request to Zoom Chatbot.`);
    }
    const userId = req.body.userId;


    try {
       

      switch (event) {
        case 'bot_installed':
          // Handle new subscription
          return res.status(200).json({ message: 'Subscription added successfully' });
        case 'bot_notification':
          
          return controller.sendAChatCommand(req, res, next);
        case 'chat_message.card_shared': 
          // Handle payment success
          return res.status(200).json({ message: 'Payment processed successfully' });
        case 'team_chat.link_shared':
          console.log('team_chat.link_shared event received!');
          
          return controller.sendUnfurlChatMessage(req, res, next)
        case 'interactive_message_select':
          // Handle new subscription
          return res.status(200).json({ message: 'Subscription added successfully' });
        case 'interactive_message_actions':
          // Handle new subscription
          return res.status(200).json({ message: 'Subscription added successfully' });

        default:
          // Handle unknown event
          return res.status(400).json({ message: 'Unknown event type' });
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      return res.status(500).json({ message: 'Internal server error' });
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


};
