const router = require('koa-router')()
const { create, login, checkLogined } = require('../controllers/user')

router.prefix('/user')

router.post('/register', checkLogined, create)

router.post('/login', login)

module.exports = router
