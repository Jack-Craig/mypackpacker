var express = require('express')
var router = express.Router()

// define the home page route
router.get('/', function (req, res) {
  res.render('404', {user: req.user, pageTitle: 'Lost'})
})

module.exports = router