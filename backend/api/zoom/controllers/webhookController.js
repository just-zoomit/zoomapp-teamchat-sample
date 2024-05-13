
const { createProxyMiddleware } = require('http-proxy-middleware')
const crypto = require('crypto');
const zoomApi = require('../../../util/zoom-api')
const store = require('../../../util/store')

module.exports = {

  /**
 * Signs a message using HMAC SHA256 with the client secret.
 * This is typically used to ensure messages sent to a Zoom chatbot are verified.
 * 
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the stack.
 */
  async sign(req, res, next) {
    // Validate that a message has been provided in the request body
    const { message } = req.body;
    console.log("message: ", message, "\n")
    if (!message) {
      return res.status(400).json({ error: 'Message parameter is required.' });
    }

    try {
      // Prepare the data to sign
      const timestamp = Date.now().toString();
      const dataToSign = `v0:${timestamp}:${message}`;

      // Create the HMAC SHA256 signature
      const signature = crypto.createHmac('sha256', process.env.ZOOM_APP_CLIENT_SECRET)
        .update(dataToSign)
        .digest('hex');

      // Send the signature and timestamp back to the client
      res.json({ signature, timestamp });
    } catch (error) {
      console.error('Failed to sign the message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  async handleWebhook(req, res, next) {
    const { event, data } = req.body;

    try {
      switch (event) {
        case 'bot_installed':
          // Handle new subscription
          return res.status(200).json({ message: 'Subscription added successfully' });
        case 'bot_notification':
          // Handle new subscription
          return res.status(200).json({ message: 'Subscription added successfully' });
        case 'chat_message.card_shared': 
          // Handle payment success
          return res.status(200).json({ message: 'Payment processed successfully' });
        case 'team_chat.link_shared':
          // Handle payment failure
          return res.status(200).json({ message: 'Payment failed' });
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
