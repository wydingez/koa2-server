const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session2')
const parameter = require('koa-parameter')
const config = require('./config')
const koajwt = require('koa-jwt')
const koaBody = require('koa-body')

const Store = require('./util/store')
const routing = require('./routers')

// error handler
onerror(app)
parameter(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

// json
app.use(json())

// logger
app.use(logger())

// static
app.use(require('koa-static')(__dirname + '/public'))

// session
app.use(session({
  key: config.name,
  store: new Store()
}))

// koa-body
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 20 * 1024 * 1024
  }
}))

// jwt
// app.use(koajwt({
//   secret: config.tokenSecret
// }).unless({
//   path: [/\/user\/login/]
// }))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

routing(app)

module.exports = app
