const User = require('../models/user')
const db = require('../util/db')
const bcrypt = require('../util/bcrypt')

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
   * 登录
   */
  async login (ctx) {
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
    }
  }

  async checkLogined (ctx, next) {
    if (!ctx.session.view) ctx.throw(409, '登录超时，请重新登录')
    await next()
  }
}

module.exports = new UserCtl()