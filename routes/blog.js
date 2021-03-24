const router = require('express').Router()
router.get('/', async (req, res) => {
    res.render('blog', {user: req.user})
})

module.exports = router