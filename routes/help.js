const router = require('express').Router()

router.get('/', async (req, res) => {
    res.render('faq', {user: req.user})
})

module.exports = router