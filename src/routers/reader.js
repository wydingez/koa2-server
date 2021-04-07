const router = require('koa-router')()
const textract = require('textract')
const path = require('path')
const fse = require('fs-extra')
const uuid = require('uuid')

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
              size: (fileInfo.size / 1024 / 1024).toFixed(2) + 'MB'
            })
          })
        }))
      })

      Promise.all(promiseList).then((result) => {
        ctx.body = {
          code: 200,
          data: result,
          msg: '查询成功'
        }
  
        resolve()
      })
    })
  })
})

// 读取文件信息
router.post('/readDoc', (ctx) => {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(PUBLIC_PATH + '/YD-C070100 顾客反馈处理程序.doc', (err, text) => {
      if (err) {
        ctx.throw(500, err)
        console.log(err)
      }
  
      ctx.body = {
        code: 200,
        data: text,
        msg: '解析成功'
      }

      resolve()
    })
  })
})

// 上传文件
router.post('/uploadDoc', (ctx) => {
  const files = ctx.request.files.file
  const confirmUnique = false
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

module.exports = router