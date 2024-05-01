const { Router } = require('express')
const router = Router()
const controller = require('./controller')
const { getUser,  sendAChatMessage, refreshToken, setZoomAuthHeader } = require('./middleware')
router.use(
  '/api',
  getUser,
  sendAChatMessage,
  refreshToken,
  setZoomAuthHeader,
  controller.proxy
)
module.exports = router
