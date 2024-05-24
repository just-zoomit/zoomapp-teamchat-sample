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
   // Send a Chat Message
   async getUserChatChannels(req, res, next) {
    try {
      console.log(
        'GET USERS CHAT CHANNELS ==========================================================',
        '\n'
      )

      const users = req?.session?.user

      if (!users) {
        return next(
          new Error(
            'No session or no user. You may need to close and reload or reinstall the application'
          )
        )
      }

      const appUser = await store.getUser(users)
      req.appUser = appUser

      const response = await zoomApi.listUserChatChannels(appUser.accessToken)

      const channels = response.data.channels

      res.status(200).json({ channels });
      
    } catch (error) {
      return res.status(500).json({ error: 'Error listing chat channels', details: error.message });

    }
  }

  ,

  // Send a Chat Message
  async sendAChatMessage(req, res, next) {
    try {
      console.log('SEND A CHAT MESSAGE HANDLER ==========================================================', '\n')
      console.log('Request payload:', req.body)

      const users = req?.session?.user

      if (!users) {
        return next(new Error('No session or no user. You may need to close and reload or reinstall the application'))
      }

      const appUser = await store.getUser(users)
      req.appUser = appUser
      console.log('App User:', appUser)

      await zoomApi.sendAChatMessage(appUser.accessToken, req.body)
      res.status(200).send();

    } catch (error) {
      return next(new Error('Error sending chat message ', error))
    }

  }, // Add this
  async sendAChatCommand(req, res, next) {
    console.log('SEND A CHAT COMMAND HANDLER');

    console.log('Request payload:', req.body);

    // Using optional chaining to avoid TypeError if payload is undefined
    const { userId, cmd: command } = req.body.payload || {};

    console.log("Command:", command, "User ID:", userId);

    // Check if command is present. If not, send a 200 OK response.
    if (!command) {
      return res.status(200).send();
    }

    // Split and trim the command to get from and to dates
    const [from, to] = command.split(',').map(date => date.trim());
    console.log("Processing command:", command, "From:", from, "To:", to);

    // Check if authorization is valid
    if (req.headers.authorization !== process.env.zoom_verification_token) {
      return res.status(401).send(`/${command} api -- Unauthorized request to Zoom Chatbot.`);
    }

    // Check if userId is provided before proceeding
    if (!userId) {
      console.log('User ID is required but was not provided.');
      return res.status(400).send('User ID is required.');
    }

    try {
      // Fetch user details, token, and recordings using the provided userId
      const appUser = await store.getUser(userId);
      if (!appUser) {
        console.log('No user found with the provided User ID.');
        return res.status(404).send('User not found.');
      }

      const chatbotToken = await zoomApi.getChatbotToken();
      console.log('Chatbot Token:', chatbotToken);
      const recordings = await zoomApi.getZoomRecordings(appUser.accessToken, from, to);
      const chatBody = zoomApi.generateChatBody(recordings, req.body.payload);

      // Send the interactive chat message
      await zoomApi.sendIMChat(chatBody, chatbotToken);

      res.status(200).send();
    } catch (error) {
      console.error('Error occurred:', error);
      // Handle errors appropriately by sending a 500 Internal Server Error response
      res.status(500).send(`/${command} api -- Internal Server Error`);
    }
  },
  async sendIMMessage(req, res, next) {
    console.log('SEND AN IM CHAT MESSAGE ====================================================', '\n');

    console.log('Request payload:', req.body);

    // Check if command is present. If not, send a 200 OK response.
    if (!req.body) {
      return res.status(200).send();
    }
    try {
      // Fetch user details, token, and recordings using the provided userId
      const appUser = await store.getUser(userId);
      if (!appUser) {
        console.log('No user found with the provided User ID.');
        return res.status(404).send('User not found.');
      }

      const chatbotToken = await zoomApi.getChatbotToken();
      const chatBody = req.body.payload;

      // Send the interactive chat message
      await zoomApi.sendIMChat(chatBody, chatbotToken);

      res.status(200).send();
    } catch (error) {
      console.error('Error occurred:', error);
      // Handle errors appropriately by sending a 500 Internal Server Error response
      res.status(500).send(`/${command} api -- Internal Server Error`);
    }
  },
  // Add this
  async sendUnfurlChatMessage(req, res, next)  {
  try {

    const chatbotToken = await zoomApi.getChatbotToken();
  
    const customMessage = zoomApi.createCustomZoomMessage(req.body.payload, {
      headText: "Updated Attendance Form",
      firstName: "Alice",
      lastName: "Johnson"
    });

    await zoomApi.sendUnfurlChat(customMessage, chatbotToken); // Corrected function name

    res.status(200).send();
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send(`Internal Server Error`);
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
