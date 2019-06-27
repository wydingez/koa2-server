const router = require('koa-router')()

router.prefix('/file')

router.post('/upload', function(ctx, next) {
  console.log(ctx.response.files)
  ctx.body = 'upload'
})

module.exports = router

