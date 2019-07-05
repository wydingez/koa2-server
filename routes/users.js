const router = require('koa-router')()
const db = require('../util/db')

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.get('/add', async function (ctx, next) {
  let res = await db.getInstance().insert('user', {
    name: ctx.query.name,
    age: ctx.query.age
  }, false)
  if (res.success) {
    ctx.body = 'Insert User success!'
  }
})

module.exports = router
