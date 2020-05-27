const router = require('koa-router')()
const { create, login_session, checkLogined_session, login_token } = require('../controllers/user')

router.prefix('/user')

router.post('/register', checkLogined_session, create)

router.post('/login_session', login_session)

router.post('/login_token', login_token)

module.exports = router
