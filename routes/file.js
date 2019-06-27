const fs = require('fs')
const router = require('koa-router')()
const koaBody = require('koa-body')

router.prefix('/file')

router.post('/upload', koaBody({multipart: true}), async function(ctx) {
  const { name } = ctx.request.body
  const file = ctx.request.files.file
  const reader = fs.createReadStream(file.path)

  return new Promise((resolve, reject) => {
    fs.mkdir('./upload-temp', function (err) {
      const upStream = fs.createWriteStream(`./upload-temp/${Math.random()}_${file.name}`)
      reader.pipe(upStream)
      resolve(() => {
        ctx.body = `${name} upload success`
      })
    })
  })
})

module.exports = router

