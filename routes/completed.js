const express = require('express')
const router = express.Router()
const _ = require('lodash')
const BuildModel = require('../models/Build')
const BuildAgg = require('../helpers/aggregatePack')
const ObjectId = require('mongoose').Types.ObjectId
const CategoryModel = require('../models/Category')
const SubCategoryModel = require('../models/SubCategory')
const ensureAuthenticated = require('../helpers/auth').ensureAuthenticated
const UserModel = require('../models/user')
const FilterEngine = require('../helpers/filterGenerator')

const PAGINATION_ROW_LIMIT = 20
// Route specific sorting, includes base sort and stuff specific to community packs, like rating
const r_SORT_KEY_OBJ = {
  'rating1': { upvotes: 1 },
  'rating0': { upvotes: -1 },
  'weight1': { 'totalWeight.weight': 1 },
  'weight0': { 'totalWeight': -1 },
  'price1': { 'priceRange.minPrice': 1 },
  'price0': { 'priceRange.minPrice': -1 }
}
const r_SORT_DISPLAY_VALS = [
  { text: 'Price-low to high', val: 'price1' },
  { text: 'Price-high to low', val: 'price0' },
  { text: 'Weight-low to high', val: 'weight1' },
  { text: 'Weight-high to low', val: 'weight0' },
  { text: 'Rating-high to low', val: 'rating0' },
  { text: 'Rating-low to high', val: 'rating1' },
]
const r_FILTER_KEY_OBJ = [
  { labelText: "Price", vsKey: "fP", key: "priceRange.minPrice", t: "list" },
  { labelText: "Weight", vsKey: "fW", key: "totalWeight", t: "list" },
  { labelText: "Search", vsKey: "tex", key: "$text", t: 'tex' },
  { labelText: "Rating", vsKey: "rat", key: "productInfo.rating.r", t: "list" }
]

router.get('/', async (req, res) => {
  const filterVS = await BuildModel.findById('6018bdb379eaf0da8c509892').lean()
    const filterData = {
      routeSorts: r_SORT_DISPLAY_VALS,
      categorySorts: [],
      routeFilters: [{ t: 'tex', key: '$text', labelText: 'Search', vsKey: 'tex' }],
      categoryFilters: [ { t: 'list', key: 'upvotes', labelText: 'Likes', vsKey: 'upv', step:1}],
      vsStore: filterVS.vsStore
    }
    res.render('completed', { user: req.user, filterData: filterData, sortVal: req.query.sort})
})

router.get('/content', async (req, res) => {
  const page = req.query.page ? req.query.page : 0
  const sortQuery = req.query.sort ? r_SORT_KEY_OBJ[req.query.sort] : false
  const filterVS = await BuildModel.findById('6018bdb379eaf0da8c509892').lean()
  const fe = new FilterEngine({ filters: [] }, r_FILTER_KEY_OBJ, req.query)
  let filterObj = { published: true, ...fe.toMongo() }
  let pipeline
  if (sortQuery)
    pipeline = [{$match: filterObj},{$sort: sortQuery},{$skip: PAGINATION_ROW_LIMIT*page},{$limit: PAGINATION_ROW_LIMIT}, {$lookup: {from: 'users', localField: 'authorUserID', foreignField: '_id', as: 'authorUserObj'}}, {$unwind: '$authorUserObj'}]
  else
    pipeline = [{$match: filterObj},{$skip: PAGINATION_ROW_LIMIT*page},{$limit: PAGINATION_ROW_LIMIT}, {$lookup: {from: 'users', localField: 'authorUserID', foreignField: '_id', as: 'authorUserObj'}}, {$unwind: '$authorUserObj'}]
  
  Promise.all([
    BuildModel.aggregate(pipeline),
    BuildModel.countDocuments(filterObj).lean() // TODO: Move to aggregation call
  ]).then(results => {
    const filterData = {
      routeSorts: r_SORT_DISPLAY_VALS,
      categorySorts: [],
      routeFilters: [{ t: 'tex', key: '$text', labelText: 'Search', vsKey: 'tex' }],
      categoryFilters: [ { t: 'list', key: 'upvotes', labelText: 'Likes', vsKey: 'upv', step:1}],
      vsStore: filterVS.vsStore
    }
    res.render('completedContent', {layout: 'blank', user: req.user, packs: results[0], filterData: filterData, sortVal: req.query.sort, currentPage: page, maxPages: Math.ceil(results[2] / PAGINATION_ROW_LIMIT) })
  }).catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})

// Votes
const vote = async (user, packId, voteId) => {
  let voteAmt = voteId
  if (user.hasOwnProperty('communityPackLikes') && user.communityPackLikes.hasOwnProperty(packId)) {
    if (user.communityPackLikes[packId] == voteId) {
      // Unlike
      await UserModel.findByIdAndUpdate(user._id, { [`communityPackLikes.${packId}`]: 0 }).lean()
      const newBuild = await BuildModel.findByIdAndUpdate(packId, { $inc: { upvotes: -voteId } }, { new: true }).lean()
      return newBuild.upvotes
    }
    if (user.communityPackLikes[packId] != 0)
      voteAmt *= 2
  }
  await UserModel.findByIdAndUpdate(user._id, { [`communityPackLikes.${packId}`]: voteId }).lean()
  // Use projection?
  const newBuild = await BuildModel.findByIdAndUpdate(packId, { $inc: { upvotes: voteAmt } }, { new: true }).lean()
  return newBuild.upvotes
}
router.get('/vote/upvote/:packId', ensureAuthenticated, async (req, res) => {
  const updatedLiked = await vote(req.user, req.params.packId, 1)
  res.send({ updatedLikes: updatedLiked })
})

router.get('/vote/downvote/:packId', ensureAuthenticated, async (req, res) => {
  const updatedLiked = await vote(req.user, req.params.packId, -1)
  res.send({ updatedLikes: updatedLiked })
})

router.get('/:packId', async (req, res) => {
  Promise.all([
    CategoryModel.find().lean(),
    SubCategoryModel.find().lean(),
    BuildAgg({ _id: ObjectId(req.params.packId) }, shouldAddUser=true)
  ]).then(data => {
    let [categories, subCategories, pack] = data
    if (pack.length)
      pack = pack[0]
    let totalWeight = 0
    let baseWeight = 0
    let wornWeight = 0
    let userOwnedObj = {}
    let userSavedObj = {}
    for (cat of categories) {
      for (i in cat.subCategories) {
        cat.subCategories[i] = _.find(subCategories, (c) => c._id === cat.subCategories[i])
        const subCat = cat.subCategories[i]
        if (!pack.hasOwnProperty('build') || subCat === undefined || !pack.build.hasOwnProperty(subCat._id))
          continue
        for (let gearItem of pack.build[subCat._id]) {
          const gIWeight = gearItem.productInfo.weight
          if (!gIWeight)
            continue
          if (subCat.weightCat === 'worn') {
            wornWeight += gIWeight
          } else {
            baseWeight += gIWeight
          }
          totalWeight += gIWeight
          if (req.user) {
            if (userOwnedObj[gearItem._id]) {
              gearItem.ownedByUser = true
            }
            if (userSavedObj[gearItem._id]) {
              gearItem.savedByUser = true
            }
          }
        }
      }
    }
    totalWeight = Math.floor(totalWeight * 100) / 100
    baseWeight = Math.floor(baseWeight * 100) / 100
    wornWeight = Math.floor(wornWeight * 100) / 100
    res.render('completedSingle', { user: req.user, pack: pack, categoryList: categories, tWeight: totalWeight, bWeight: baseWeight, wWeight: wornWeight, editable: false })
  })
})

module.exports = router