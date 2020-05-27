const User = require('../models/user')
const db = require('../util/db')
const bcrypt = require('../util/bcrypt')
const jwt = require('jsonwebtoken')
const config = require('../config')

class UserCtl extends db {
  constructor () {
    super()
  }

  /**
   * 创建用户
   */
  async create (ctx) {
    ctx.verifyParams({
      username: { type: 'string', required: true },
      password:  {type: 'string', required: true },
      name:  {type: 'string', required: true },
      age:  {type: 'number' }
    })

    let { username, password } = ctx.request.body
    let repeat = await User.findOne({username})
    if (repeat) {
      ctx.throw(409, '用户已经存在')
    }

    let user = await new User(Object.assign({}, ctx.request.body, {password: bcrypt.encrypt(password)})).save()
    ctx.body = user
  }

  /**
   * 登录-session
   */
  async login_session (ctx) {
    ctx.verifyParams({
      username: { type: 'string', required: true },
      password:  {type: 'string', required: true }
    })
    
    let { username, password } = ctx.request.body
    let user = await User.findOne({username})
    if (!user) {
      ctx.throw(409, '用户不存在')
    } else if (!bcrypt.decrypt(password, user.password)) {
      ctx.throw(409, '密码不正确')
    } else {
      ctx.session.view = user
      ctx.body = {
        code: 200,
        data: user,
        msg: '登录成功'
      }
    }
  }

  async login_token (ctx) {
    ctx.verifyParams({
      username: { type: 'string', required: true },
      password:  {type: 'string', required: true }
    })
    
    let { username, password } = ctx.request.body
    let user = await User.findOne({username})
    if (!user) {
      ctx.throw(409, '用户不存在')
    } else if (!bcrypt.decrypt(password, user.password)) {
      ctx.throw(409, '密码不正确')
    } else {
      const tokenInfo = {username: user.username, name: user.name, age: user.age, _id: user._id}
      const token = jwt.sign(tokenInfo, config.tokenSecret, { expiresIn: '2h' })
      ctx.body = {
        code: 200,
        data: token,
        msg: '登录成功'
      }
    }
  }

  async checkLogined_session (ctx, next) {
    if (!ctx.session.view) ctx.throw(409, 'Session超时，请重新登录')
    await next()
  }
}

module.exports = new UserCtl()