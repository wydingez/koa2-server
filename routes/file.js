const fs = require('fs')
const router = require('koa-router')()
const koaBody = require('koa-body')
const send = require('koa-send')

const FILES_DIR = './upload-temp'

router.prefix('/file')

function doUpload (ctx) {
  const files = ctx.request.files.file
  const { name } = ctx.request.body

  return new Promise((resolve, reject) => {
    files.forEach((file, index) => {
      const reader = fs.createReadStream(file.path)
      fs.mkdir(FILES_DIR, function (err) {
        const upStream = fs.createWriteStream(`${FILES_DIR}/${Math.random()}_${file.name}`)
        reader.pipe(upStream)
        
        if (index === files.length - 1) {
          resolve({
            code: 20000,
            data: {},
            message: `${name} upload success`
          })
        }
      })
    })
  })
}

function getFiledList (path) {
  let fileList = []
  const files = fs.readdirSync(path)
  files.forEach((item, index) => {
    let stat = fs.lstatSync(`${path}/${item}`)
    if (!stat.isDirectory()) {
      fileList.push({
        id: index,
        path,
        name: item
      })
    }
  })
  return fileList
}

/**
 * 上传文件
 */
router.post('/upload', koaBody({multipart: true}), async function(ctx) {
  let ret = await doUpload(ctx)
  ctx.body = ret
})

/**
 * 获取文件列表
 */
router.post('/fileList', function (ctx) {
  let list = getFiledList(FILES_DIR)
  ctx.body = {
    code: 20000,
    data: list
  }
})

/**
 * 文件下载
 */
router.get('/download/:id', async function(ctx) {
  let list = getFiledList(FILES_DIR)
  const id = ctx.params.id
  const path = `${FILES_DIR}/${list[id].name}`
  ctx.attachment(path)
  await send(ctx, path)
})

/**
 * 文件删除
 */
router.post('/del/:id', async function(ctx) {
  let list = getFiledList(FILES_DIR)
  const id = ctx.params.id
  const path = `${FILES_DIR}/${list[id].name}`
  let ret = await new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve({
        code: 20000,
        message: '删除成功'
      })
    })
  })
  ctx.body = ret
})

module.exports = router

