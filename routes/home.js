var express = require('express')
var router = express.Router()
const {performance} = require('perf_hooks')

const BuildModel = require('../models/Build')
const ImageModel = require('../models/Image')

// define the home page route
router.get('/', async (req, res) => {
  //BuildModel.aggregate([{published: true}).sort({upvotes:-1}).limit(3).lean()
  BuildModel.aggregate([{$match: {published: true}}, {$sort: {upvotes: -1}}, {$limit: 3},  {$lookup: {from: 'users', localField: 'authorUserID', foreignField: '_id', as: 'authorUserObj'}}, {$unwind: '$authorUserObj'}]).then(async docs => {
    res.render('main', {user: req.user, communityPacks: docs})
  }).catch(err => {
    console.log(err)
    res.render('main', {user: req.user})
  }) 
})
module.exports = router