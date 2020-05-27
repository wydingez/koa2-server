const mongoose = require('mongoose')
const schema = require('../models')
const config = require('../config')

class db {
  constructor () {
    if (!this.client) {
      this.client = ''
    }
    this.connect()
  }

  connect () {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        this.client = mongoose.connect(config.mongodb, {
          useNewUrlParser: true,
          authSource: 'admin'
        })

        // connect success
        mongoose.connection.on('connected', () => {
          console.log(`Mongodb connect success: ${config.mongodb}`)
          resolve(this.client)
        })

        // connect disconnected
        mongoose.connection.on('disconnected', (err) => {
          console.log(`Mongoose disconnected`)
          reject(err)
        })
      } else {
        resolve(this.client)
      }
    })
  }

  insert (table, obj, canRepeat) {
    return new Promise((resolve, reject) => {
      try {
        // 默认允许插入重复数据
        const flag = canRepeat === undefined ? true : canRepeat
        this.connect().then(() => {
          if (flag) {
            new schema[table](obj).save(err => {
              err ? reject(err) : resolve({success: true})
            })
          } else {
            this.find(table, obj).then(res => {
              if (res.length > 0) {
                resolve({success: true})
              } else {
                new schema[table](obj).save(err => {
                  err ? reject(err) : resolve({success: true})
                })
              }
            })
          } 
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  find (table, obj = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.connect().then(() => {
          schema[table].find(obj, (err, doc) => {
            err ? reject(err) : resolve({success: true, data: doc, length: doc.length})
          })
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  delete (table, obj) {
    return new Promise((resolve, reject) => {
      try {
        this.connect().then(() => {
          schema[table].deleteMany(obj, err => {
            err ? reject(err) : resolve({success: true})
          })
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  update (table, old, now) {
    return new Promise((resolve, reject) => {
      try {
        this.connect().then(() => {
          schema[table].updatMany(old, {$set, now}, err => {
            err ? reject(err) : resolve({success: true})
          })
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}

module.exports = db
