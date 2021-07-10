var express = require('express')
var router = express.Router()

router.get('/', async (req, res) => {
    res.send('<script src="/js/tracking.js"></script>')
})

module.exports = router