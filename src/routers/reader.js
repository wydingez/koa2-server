const router = require('koa-router')()
const textract = require('textract')
const path = require('path')
const fse = require('fs-extra')
const uuid = require('uuid')

const send = require('koa-send');
const archiver = require('archiver');

const PUBLIC_PATH = path.resolve(__dirname, '../../public/file')

router.prefix('/reader')

// 获取public目录下所有文件
router.get('/listDoc', (ctx) => {
  return new Promise((resolve, reject) => {
    fse.readdir(PUBLIC_PATH, (err, files) => {
      if (err) {
        console.log(err)
      }

      let promiseList = []

      files.forEach(file => {
        promiseList.push(new Promise((r, j) => {
          fse.stat(`${PUBLIC_PATH}/${file}`, (err, fileInfo) => {
            if (err) {
              console.log(err)
            }

            r({
              name: file,
              type: file.substring(file.lastIndexOf('.')),
              size: (fileInfo.size / 1024 / 1024).toFixed(2) + 'MB'
            })
          })
        }))
      })

      Promise.all(promiseList).then((result) => {
        ctx.body = {
          code: 200,
          result: result,
          msg: '查询成功'
        }
  
        resolve()
      })
    })
  })
})

// 读取文件信息
router.get('/readDoc/:name', (ctx) => {
  const name = ctx.params.name
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(`${PUBLIC_PATH}/${name}`, (err, text) => {
      if (err) {
        ctx.throw(500, err)
        console.log(err)
      }
  
      ctx.body = {
        code: 200,
        result: text,
        msg: '解析成功'
      }

      resolve()
    })
  })
})

// 上传文件
router.post('/uploadDoc', (ctx) => {
  let files = ctx.request.files.file
  const confirmUnique = false

  if (!Array.isArray(files)) {
    files = [files]
  }

  for (let file of files) {
    const reader = fse.createReadStream(file.path)
    
    let fileName = file.name
    if (confirmUnique) {
      let preName = file.name.substring(0, file.name.lastIndexOf("."))
      let extendName = file.name.substring(file.name.lastIndexOf(".") + 1)

      fileName = `${preName}_${uuid.v4()}.${extendName}`
    }
    

    let filePath = `${PUBLIC_PATH}/${fileName}`

    const upStream = fse.createWriteStream(filePath)

    reader.pipe(upStream)
  }

  ctx.body = {
    code: 200,
    msg: '上传成功'
  }
})

// 删除文件
router.delete('/delDoc/:name', (ctx) => {
  return new Promise((r, j) => {
    const fPath = `${PUBLIC_PATH}/${ctx.params.name}`

    fse.access(fPath, (err) => {
      if (err) {
        ctx.throw(500, '该文件不存在')
      } else {
        fse.unlink(fPath, (err) => {
          if (err) {
            console.log(err)
          }
        })

        ctx.body = {
          code: 200,
          msg: '删除成功'
        }
      }

      r()
    })
  })
})

// 删除所有文件
router.delete('/delAllDoc', (ctx) => {
  return new Promise((r, j) => {
    const fPath = `${PUBLIC_PATH}/`

    fse.access(fPath, (err) => {
      if (err) {
        ctx.throw(500, '目录不存在')
      } else {
        fse.unlink(fPath, (err) => {
          if (err) {
            console.log(err)
          }
        })

        ctx.body = {
          code: 200,
          msg: '删除成功'
        }
      }

      r()
    })
  })
})

// 下载文件
router.get('/download/:name', async (ctx) => {
  const name = ctx.params.name
  const path = `public/file/${name}`
  ctx.attachment(path)
  await send(ctx, path);
})

// 下载所有文件
router.get('/downloadAll', async (ctx) => {
  const zipName = 'all.zip'
  const zipStream = fse.createWriteStream(zipName)
  const zip = archiver('zip')
  zip.pipe(zipStream)
  // 添加整个文件夹到压缩包
  zip.directory('public/file/', false)
  await zip.finalize()

  ctx.attachment(zipName)
  await send(ctx, zipName)
})

module.exports = router