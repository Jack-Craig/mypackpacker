const rsmq = require('rsmq')

const QUEUENAME = 'all_messages'
const NAMESPACE = 'packpacker'

const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT
const REDIS_PASS = process.env.REDIS_PASS

let mq = new rsmq({
    host: REDIS_HOST,
    port: REDIS_PORT,
    ns: NAMESPACE,
    password: REDIS_PASS,
    vt: 0
})

module.exports = {
    rsmq: mq,
    queueName: QUEUENAME
}