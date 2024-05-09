const { Router } = require('express')
const router = Router()
const controller = require('./controller')
const { getUser, refreshToken, setZoomAuthHeader} = require('./middleware')
router.use(
  '/api',
  getUser,
  refreshToken,
  setZoomAuthHeader,
  controller.proxy,)
  .post('/sign', controller.sign)
  .post('/sendAChatMessage', controller.sendAChatMessage)
  .post('/:command', controller.sendAChatCommand)
  
module.exports = router
