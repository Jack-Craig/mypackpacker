var express = require('express')
var router = express.Router()
const { performance } = require('perf_hooks')

const BuildModel = require('../models/Build')
const ImageModel = require('../models/Image')

// define the home page route
router.get('/', async (req, res) => {
  const featuredList = [{
    _id: '6005252e046acb39d02a5f94',
    brand: 'REI Co-op',
    categoryID: 'backpacks',
    displayName: "REI Co-op Trailbreak 60 Pack - Men's",
    lowestPriceRange: {
      minPrice: 149,
      maxPrice: null
    },
    productInfo: {
      weight: 1728,
      type: 'Backpacking Packs',
      rating: {
        r: 4.8,
        n: 12
      }
    }
  },
  {
    _id: '6005252e046acb39d02a5f94',
    brand: 'REI Co-op',
    categoryID: 'backpacks',
    displayName: "REI Co-op Trailbreak 60 Pack - Men's",
    lowestPriceRange: {
      minPrice: 149,
      maxPrice: null
    },
    productInfo: {
      weight: 1728,
      type: 'Backpacking Packs',
      rating: {
        r: 4.8,
        n: 12
      }
    }
  }]
  BuildModel.aggregate([{ $match: { published: true } }, { $sort: { upvotes: -1 } }, { $limit: 3 }, { $lookup: { from: 'users', localField: 'authorUserID', foreignField: '_id', as: 'authorUserObj' } }, { $unwind: '$authorUserObj' }]).then(async docs => {
    res.render('main', { user: req.user, communityPacks: docs, featuredList: featuredList })
  }).catch(err => {
    console.log(err)
    res.render('main', { user: req.user })
  })
})
module.exports = router