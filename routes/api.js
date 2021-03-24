const express = require('express')
const router = express.Router()
const _ = require('lodash')
const rsmqM = require('../helpers/rsmqLoader')
const ImageModel = require('../models/Image')
const BuildModel = require('../models/Build')
const MessageModel = require('../models/Message')
const CategoryModel = require('../models/Category')
const SubCategoryModel = require('../models/SubCategory')
const ObjectId = require('mongoose').Types.ObjectId
const BuildAgg = require('../helpers/aggregatePack')

let rsmq = rsmqM.rsmq
const rsmqQ = rsmqM.queueName

router.get('/image/:assId/:subId', (req, res) => {
    ImageModel.findOne({ associatedID: req.params.assId, associatedSubID: req.params.subId }).lean().then(imageDoc => {
        const src = `data:image/${imageDoc.img.contentType};base64,${imageDoc.img.data.toString('base64')}`
        res.send({ src: src })
    }).catch(err => {
        res.sendStatus(500)
        console.log(err)
    })
})

router.post('/messages/create', async (req, res) => {
    console.log('Message Received')
    if (req.isAuthenticated())
        req.body.senderId = req.user._id
    else
        req.body.senderId = null
    req.body.date = Date.now()
    if (req.body.isWorkerMessage === 'true')
        return res.sendStatus(503)
    rsmq.sendMessage({
        qname: rsmqQ,
        delay: 0,
        message: JSON.stringify(req.body)
    }, e => {
        if (e) {
            console.error(e)
            return res.sendStatus(500)
        }
        res.sendStatus(200)
    })
})

router.delete('/messages/delete/:mid', async (req, res) => {
    await MessageModel.findByIdAndDelete(req.params.mid).lean()
    res.sendStatus(200)
})

router.get('/packData/:packId', async (req, res) => {
    const packId = {_id: ObjectId(req.params.packId)}
    BuildAgg(packId).then(pack => {
        if (pack.length)
            return res.send(pack[0])
    }).catch(e => {
        console.log(e)
        res.sendStatus(500)
    })
})

router.get('/categories', async (req, res) => {
    SubCategoryModel.find().lean().then(cats => {
        res.send(cats)
    }).catch(e => {
        console.log(e)
        res.sendStatus(500)
    })
})

router.get('/pack/render/', async (req, res) => {
  let query
  if (req.user)
    query = {_id: ObjectId(req.user.activePackId)}
  else {
    const s = req.session
    query = {_id: ObjectId(s.activePackId)}
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
    res.render('buildContent', { categoryList: categories, buildData: sessionBuildData, user: req.user, editable: true, userOwnedObj: userOwnedObj, userSavedObj: userSavedObj, layout: 'blank' })
  }).catch(e => {
    console.error(e)
    res.sendStatus(500)
  })
})


module.exports = router