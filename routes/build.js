const express = require('express')
const router = express.Router()
const _ = require('lodash')
const ObjectId = require('mongoose').Types.ObjectId
const ensureAuthenticated = require('../helpers/auth').ensureAuthenticated
const CategoryModel = require('../models/Category')
const SubCategoryModel = require('../models/SubCategory')
const ProductModel = require('../models/Product')
const BuildModel = require('../models/Build')
const UserModel = require('../models/user')
const BuildAgg = require('../helpers/aggregatePack')
const FilterEngine = require('../helpers/filterGenerator')

const priceRangeHelpers = require('../helpers/priceRange')
const PAGINATION_ROW_LIMIT = 50
const r_SORT_KEY_OBJ = {
  'reviews1': {'productInfo.rating.r': 1},
  'reviews0': {'productInfo.rating.r': -1},
  'weight1': { 'productInfo.weight': 1 },
  'weight0': { 'productInfo.weight': -1 },
  'price1': { 'lowestPriceRange.minPrice': 1 },
  'price0': { 'lowestPriceRange.minPrice': -1 },
  'brand': { 'brand': 1 }
}
const r_SORT_DISPLAY_VALS = [
  {val: 'reviews0', text: 'Reviews: High to Low'},
  {val: 'reviews1', text: 'Reviews: Low to High'},
  { val: 'weight1', text: "Weight: Low to High" },
  { val: 'weight0', text: "Weight: High to Low" },
  { val: 'price1', text: "Price: Low to High" },
  { val: 'price0', text: "Price: High to Low" },
  { val: 'brand', text: "Brand" }
]
const r_FILTER_PROJECTION_OBJ = {
  'fP': { key: 'lowestPriceRange', val: 1 }, // Price filter
  'fW': { key: 'productInfo.weight', val: 1 } // Weight filter
}
const r_FILTER_KEY_OBJ = [
  { labelText: "Price", vsKey: "fP", key: "lowestPriceRange.minPrice", t: "list" },
  { labelText: "Weight", vsKey: "fW", key: "productInfo.weight", t: "list" },
  { labelText: "Search", vsKey: "tex", key: "$text", t: 'tex' },
  { labelText: "Rating", vsKey: "rat", key: "productInfo.rating.r", t: "list" }
]
router.post('/add/gear', ensureAuthenticated, async (req, res) => {
  const gearData = req.body.gearData
  let addToPackIdx = {} // int -> bool (index -> shouldAdd)
  let addToFavoriteIdx = {} // int -> bool (index -> shouldAdd)
  let addToOwnedIdx = {} // int -> bool (index -> shouldAdd)
  let erroredIndices = {}
  let promiseList = []
  for (let i = 0; i < gearData.length; i++) {
    const gearItem = gearData[i]
    addToOwnedIdx[i] = gearItem.doesUserOwn === 'true' ? true : false
    addToFavoriteIdx[i] = gearItem.doesUserFavorite === 'true' ? true : false
    addToPackIdx[i] = gearItem.shouldAddToPack === 'true' ? true : false
    if (!addToFavoriteIdx[i] && !addToOwnedIdx[i]) {
      erroredIndices[i] = true
      continue
    }
    if (_.some(gearItem, (v) => !Boolean(v))) {
      erroredIndices[i] = true
      continue
    }
    // TODO: Check if already exists? Or maybe relegate this task to some cronjob
    // i.e. Hey, we think this product exists in our database! Is this the same product?
    promiseList.push(ProductModel.create({
      displayName: gearItem.displayName,
      categoryID: gearItem.categoryId,
      priceInfo: {},
      brand: gearItem.brand,
      productInfo: {
        weight: parseFloat(gearItem.weight),
        size: 0,
        pictures: [],
        description: '',
        unaffiliatedUrl: ''
      },
      lowestPriceRange: {
        minPrice: parseFloat(gearItem.price),
        maxPrice: null
      },
      userCreated: true,
      authorUserId: req.user._id
    }))
  }
  if (promiseList.length <= 0) {
    return res.send({ errorItems: erroredIndices })
  }
  Promise.all(promiseList).then(async newGearDocs => {
    let docsUpdate = []
    let idsForOwned = []
    let idsForFavorite = []
    let minPrice = 0
    let categories = {}
    let tWeight = 0
    let bWeight = 0
    let wWeight = 0
    for (let i = 0; i < newGearDocs.length; i++) {
      const gearDoc = newGearDocs[i]
      if (addToOwnedIdx[i])
        idsForOwned.push(gearDoc._id)

      if (addToFavoriteIdx[i])
        idsForFavorite.push(gearDoc._id)

      if (addToPackIdx[i]) {
        const categoryId = gearDoc.categoryID
        if (!categories.hasOwnProperty(categoryId))
          categories[categoryId] = await SubCategoryModel.findById(categoryId).lean()
        docsUpdate.push(gearDoc._id)
        tWeight += gearDoc.productInfo.weight
        wWeight += categories[categoryId].weightCat === 'worn' ? gearDoc.productInfo.weight : 0
        bWeight += categories[categoryId].weightCat === 'pack' ? gearDoc.productInfo.weight : 0
        minPrice += gearDoc.lowestPriceRange.minPrice
      }
    }
    let promiseList = []
    const userId = req.user._id
    // Update User
    if (idsForFavorite.length > 0 || idsForOwned.length > 0) {
      const userUpdate = { $push: { gearListSaved: idsForFavorite, gearListOwned: idsForOwned } }
      promiseList.push(UserModel.findByIdAndUpdate(userId, userUpdate).lean())
    }
    // Update Pack
    if (!_.isEmpty(docsUpdate)) {
      const packUpdate = { '$inc': { 'priceRange.minPrice': minPrice, 'priceRange.maxPrice': minPrice, baseWeight: bWeight, wornWeight: wWeight, totalWeight: tWeight }, '$push': { build: { $each: docsUpdate } }, $setOnInsert: { displayName: 'New Pack' } }
      promiseList.push(new Promise(async (res, rej) => {
        const newPack = await BuildModel.findByIdAndUpdate(req.user.activePackId, packUpdate, { upsert: true, setDefaultsOnInsert: true, new: true }).lean()
        if (newPack._id != req.user.activePackId) {
          await UserModel.findByIdAndUpdate(req.user._id, {activePackId: newPack._id})
        }
        res()
      }))
    }

    Promise.all(promiseList).then(r => {
      res.send({ errorItems: erroredIndices })
    })
  })
})

router.get('/add/:id', async (req, res) => {
  const pID = ObjectId(req.params.id)
  const sessionID = req.sessionID
  const user = req.user
  ProductModel.findById(pID).lean().then(product => {
    SubCategoryModel.findById(product.categoryID).then(async productCategory => {
      const aTWeight = product.productInfo.weight
      const aBWeight = productCategory.weightCat === 'pack' ? aTWeight : 0
      const aWWeight = productCategory.weightCat === 'worn' ? aTWeight : 0
      let productPriceRange = product.lowestPriceRange
      if (!productPriceRange.maxPrice)
        productPriceRange.maxPrice = productPriceRange.minPrice
      const update = { '$inc': { wornWeight: aWWeight, baseWeight: aBWeight, totalWeight: aTWeight, 'priceRange.minPrice': productPriceRange.minPrice, 'priceRange.maxPrice': productPriceRange.maxPrice }, '$push': { 'build': pID }, $setOnInsert: { displayName: 'New Pack' } }
      if (user) {
        BuildModel.findByIdAndUpdate(user.activePackId, {...update, autherUserID: user._id}, { upsert: true, setDefaultsOnInsert: true, new: true }).lean().then(async newDoc => {
          if (newDoc._id !== user.activePackId) {
            await UserModel.findByIdAndUpdate(user._id, {activePackId: newDoc._id})
          }
          res.sendStatus(200)
        })
      } else {
        let id = req.session.activePackId
        if (!req.session.activePackId)
          id = new ObjectId()
        BuildModel.findByIdAndUpdate(id, {...update, sessionID: sessionID}, {setDefaultsOnInsert: true, new:true, upsert: true}).lean().then(async newDoc => {
          if (req.session.activePackId !== newDoc._id)
            req.session.activePackId = newDoc._id
          res.sendStatus(200)
        })
      }
    })
  }).catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})

router.get('/remove/:id', async (req, res) => {
  const pID = req.params.id
  const user = req.user
  const productDoc = await ProductModel.findById(pID).lean()
  const productCategory = await SubCategoryModel.findById(productDoc.categoryID).lean()
  let activePack = await BuildModel.findById(req.user.activePackId, {build: 1}).lean()
  
  for (let i = 0; i < activePack.build.length; ++i) {
    const strRep = activePack.build[i].toString()
    if (strRep === pID) {
      activePack.build.splice(i, 1)
      break
    }
  }
  const update = {
    'build': activePack.build,
    '$inc': {
      wornWeight: productCategory.weightCat === 'worn' ? -productDoc.productInfo.weight : 0,
      baseWeight: productCategory.weightCat === 'pack' ? -productDoc.productInfo.weight : 0,
      totalWeight: -productDoc.productInfo.weight,
      'priceRange.minPrice': -productDoc.lowestPriceRange.minPrice,
      'priceRange.maxPrice': productDoc.lowestPriceRange.maxPrice ? -productDoc.lowestPriceRange.maxPrice : -productDoc.lowestPriceRange.minPrice
    }
  }
  if (user) {
    BuildModel.findByIdAndUpdate(req.user.activePackId, update, { upsert: false }).lean().then(() => {
      res.sendStatus(200)
    }).catch(e => {
      console.error(e)
      res.sendStatus(500)
    })
  } else {
    const s = req.session
    BuildModel.findByIdAndUpdate(s.activePackId, update, { upsert: false }).lean().then(() => {
      res.sendStatus(200)
    }).catch(e => {
      console.error(e)
      res.sendStatus(500)
    })
  }
})

router.get('/', async (req, res) => {
  let query
  if (req.user)
    query = {_id: req.user.activePackId}
  else {
    query = {_id: ObjectId(req.session.activePackId)}
  }
  Promise.all([
    CategoryModel.find().lean(),
    SubCategoryModel.find().lean(),
    BuildAgg(query)
  ]).then(cats => {
    categories = cats[0]
    subCategories = cats[1]
    let sessionBuildData = cats[2]
    if (sessionBuildData.length)
      sessionBuildData = sessionBuildData[0]
    let userOwnedObj = {}
    let userSavedObj = {}
    if (req.user) {
      for (const id of req.user.gearListOwned) {
        userOwnedObj[id] = true
      }
      for (const id of req.user.gearListSaved) {
        userSavedObj[id] = true
      }
    }
    for (cat of categories) {
      for (i in cat.subCategories) {
        cat.subCategories[i] = _.find(subCategories, (c) => c._id === cat.subCategories[i])
      }
    }
    res.render('build', { categoryList: categories, buildData: sessionBuildData, user: req.user, editable: true, userOwnedObj: userOwnedObj, userSavedObj: userSavedObj })
  }).catch(e => {
    console.error(e)
    res.redirect('/pack')
  })
})

router.get('/content/:categoryID', async (req, res) => {
  const page = req.query.page ? req.query.page : 0
  const sortQuery = req.query.sort ? r_SORT_KEY_OBJ[req.query.sort] : {}
  const categoryID = req.params.categoryID
  const category = await SubCategoryModel.findById(categoryID).lean()

  const fe = new FilterEngine(category, r_FILTER_KEY_OBJ, req.query)
  let filterObj = { categoryID: categoryID, userCreated: false, ...fe.toMongo() }
  let promises = [
    ProductModel.find(filterObj).sort(sortQuery).skip(page * PAGINATION_ROW_LIMIT).limit(PAGINATION_ROW_LIMIT).lean(),
    ProductModel.countDocuments(filterObj).lean() // TODO: Move to aggregation
  ]
  Promise.all(promises).then(data => {
    let userOwnedObj = {}
    let userSavedObj = {}
    if (req.user) {
      for (const id of req.user.gearListOwned) {
        userOwnedObj[id] = true
      }
      for (const id of req.user.gearListSaved) {
        userSavedObj[id] = true
      }
    }

    const filterData = {
      routeSorts: r_SORT_DISPLAY_VALS,
      categorySorts: [],
      routeFilters: [{ t: 'tex', key: '$text', labelText: 'Search', vsKey: 'tex' }],
      categoryFilters: [{ t: 'list', labelText: 'Rating', vsKey: 'rat', step: .5, suffix: ' stars' }, ...category.filters],
      vsStore: category.vsStore
    }

    const paginationData = { currentPage: page, maxPages: Math.ceil(data[1] / PAGINATION_ROW_LIMIT) }
    res.render('categoryBody', {layout:'blank', category: category, products: data[0], user: req.user, paginationData: paginationData, userOwnedObj: userOwnedObj, userSavedObj: userSavedObj, filterData: filterData, sortVal: req.query.sort })
  }).catch(err => {
    console.error(err)
    res.sendStatus(500)
  })
})

router.get('/:categoryID', async (req, res) => {
  const categoryID = req.params.categoryID
  const category = await SubCategoryModel.findById(categoryID).lean()
  const filterData = {
    routeSorts: r_SORT_DISPLAY_VALS,
    categorySorts: [],
    routeFilters: [{ t: 'tex', key: '$text', labelText: 'Search', vsKey: 'tex' }],
    categoryFilters: [{ t: 'list', labelText: 'Rating', vsKey: 'rat', step: .5, suffix: ' stars' }, ...category.filters],
    vsStore: category.vsStore
  }
  filterData.categoryFilters.sort((a, b) => {
    if (a.t === 'list' && b.t === 'list')
      return 0
    if (a.t==='in'||a.t==='inter')
      return 1
    return -1
  })
  res.render('category', { category: category, user: req.user, filterData: filterData})
})

router.get('/:categoryID/:productID', async (req, res) => {
  const productID = req.params.productID
  const activePackId = req.user ? req.user.activePackId : req.session.actuvePackId
  Promise.all([
    ProductModel.findById(productID).lean(),
    SubCategoryModel.findById(req.params.categoryID).lean(),
    BuildModel.findById(activePackId).lean()
  ]).then(d => {
    if (!d[0])
      return res.render('404', { user: req.user })
    res.render('product', { product: d[0], category: d[1], user: req.user, userPack: d[2] })
  }).catch(err => {
    console.error(err)
    res.render('/'+req.params.categoryID)
  })
})

module.exports = router