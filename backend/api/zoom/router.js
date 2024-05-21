const { Router } = require('express')
const router = Router()
const controller = require('./controllers/controller')
const webhookController = require('./controllers/webhookController')
const { getUser, refreshToken, setZoomAuthHeader } = require('./middleware')
router
  .use('/api', getUser, refreshToken, setZoomAuthHeader, controller.proxy)
  .post('/sign', controller.sign)
  .get('/getChatChannels', controller.getUserChatChannels)
  .post('/sendAChatMessage', controller.sendAChatMessage)
  .post('/command', webhookController.handleWebhook)

module.exports = router
