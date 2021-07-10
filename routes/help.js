const router = require('express').Router()

router.get('/', async (req, res) => {
    res.render('faq', {user: req.user, pageTitle: 'FAQ'})
})
router.get('/cats', async (req, res) => {
    res.render('catExp', {user: req.user, pageTitle: 'Gear FAQ'})
})

module.exports = router