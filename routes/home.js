var express = require('express')
var router = express.Router()

const BuildModel = require('../models/Build')
const ImageModel = require('../models/Image')
const ProductModel = require('../models/Product')

// define the home page route
router.get('/', async (req, res) => {
  const promiseList = [
    // Featured Packs
    ProductModel.find({ featured: true }).lean(),
    // Featured Builds
    BuildModel.aggregate([
      { $match: {featured: true}},
      {$lookup: {
        from: 'products',
        localField: 'build',
        foreignField: '_id',
        as: 'build'
      }}
    ]),
    // Highest rated builds
    BuildModel.aggregate([{ $match: { published: true } }, { $sort: { upvotes: -1 } }, { $limit: 3 }, { $lookup: { from: 'users', localField: 'authorUserID', foreignField: '_id', as: 'authorUserObj' } }, { $unwind: '$authorUserObj' }])
  ]
  Promise.all(promiseList).then(results => {
    // Join featured packs and builds
    let featuredPacks = results[1]
    for (let pack of featuredPacks) {
      let p = {}
      for (const product of pack.build) {
        if (p.hasOwnProperty('backpack') && p.hasOwnProperty('tent') && p.hasOwnProperty('bag')) {
          break
        }
        switch (product.categoryID) {
          case 'backpacks': p.backpack = product; break;
          case 'tents': p.tent = product; break;
          case 'sleeping-bags': p.bag = product; break; 
        }
      }
      pack.build = p
    }
    featuredPacks.reverse()
    res.render('main', { user: req.user, communityPacks: results[2], featuredProducts: results[0], featuredPacks: results[1] })
  }).catch(err => {
    console.log(err)
    res.render('main', { user: req.user })
  })
})
module.exports = router