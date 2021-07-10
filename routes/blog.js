const router = require('express').Router()
router.get('/', async (req, res) => {
    res.render('blog', {user: req.user, pageTitle:'About'})
})

module.exports = router