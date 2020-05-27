const Redis = require('ioredis')
const session = require('koa-session2')
const config = require('../config')

class RedisStroe extends session.Store {
  constructor () {
    super()
    this.redis = new Redis(config.redis)
    this.redis.on('connect', () => {
      console.log(`Redis connect success: ${config.redis}`)
    })
  }

  async get (sid, ctx) {
    let data = await this.redis.get(`SESSION:${sid}`)
    return JSON.parse(data)
  }

  async set (session, { sid = this.getID(24), maxAge = 10000 } = {}, ctx) {
    try {
      // Use redis set EX to automatically drop expired sessions
      await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000)
    } catch (e) {}
    return sid
  }

  async destroy (sid, ctx) {
    return await this.redis.del(`SESSION:${sid}`)
  }
}

module.exports = RedisStroe