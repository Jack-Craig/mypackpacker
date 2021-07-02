const router = require('express').Router()

router.get('/', async (req, res) => {
    res.render('faq', {user: req.user})
})
router.get('/cats', async (req, res) => {
    res.render('catExp', {user: req.user})
})

module.exports = router