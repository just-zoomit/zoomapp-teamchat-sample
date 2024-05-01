const { Router } = require('express')
const router = Router()
const controller = require('./controller')
const { getUser, sendaChatMessage, refreshToken, setZoomAuthHeader } = require('./middleware')
router.use(
  '/api',
  getUser,
  sendaChatMessage,
  refreshToken,
  setZoomAuthHeader,
  controller.proxy
)
module.exports = router
