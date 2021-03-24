const express = require('express')
const router = express.Router()
const fs = require('fs')
const _ = require('lodash')
const ImageModel = require('../../models/Image')
const CategoryModel = require('../../models/Category')
const BuildModel = require('../../models/Build')
const SubCategoryModel = require('../../models/SubCategory')
const {upload, s3} = require('../../helpers/upload')
const ensureAuthenticated = require("../../helpers/auth").ensureAuthenticated
const ObjectId = require('mongoose').Types.ObjectId
const BuildAgg = require('../../helpers/aggregatePack')
const UserModel = require('../../models/user')

router.get('/', ensureAuthenticated, async (req, res) => {
    Promise.all([
        CategoryModel.find().lean(),
        SubCategoryModel.find().lean(),
        BuildAgg({ authorUserID: ObjectId(req.user._id) })
    ]).then(cats => {
        categories = cats[0]
        subCategories = cats[1]
        packList = cats[2]
        let userOwnedObj = {}
        let userSavedObj = {}
        for (const id of req.user.gearListOwned) {
            userOwnedObj[id] = true
        }
        for (const id of req.user.gearListSaved) {
            userSavedObj[id] = true
        }
        for (cat of categories) {
            for (i in cat.subCategories) {
                cat.subCategories[i] = _.find(subCategories, (c) => c._id === cat.subCategories[i])
            }
        }
        packList.sort((a, b) => (a.displayName.localeCompare(b.displayName)))
        res.render('userPacks', { categoryList: categories, user: req.user, userPacks: packList, editable: false, userOwnedObj: userOwnedObj, userSavedObj: userSavedObj })
    }).catch(err => {
        console.log(err)
        res.sendStatus(500)
    })
})

router.get('/publish/:packID', ensureAuthenticated, async (req, res) => {
    BuildModel.findById(req.params.packID).lean().then(pack => {
        if (!pack)
            return res.render('404', { user: user })
        res.render('publish', { user: req.user, pack: pack })
    })
})


router.get('/unpublish/:packId', (req, res) => {
    BuildModel.findByIdAndUpdate(req.params.packId, { published: false }).lean().then(doc => {
        res.redirect('back')
    }).catch(err => {
        console.log(err)
        res.sendStatus(500)
    })
})

router.post('/publish', ensureAuthenticated, upload.fields([{ name: '-full.png' }, { name: '-preview.png' }]), async (req, res) => {
    ({ title, description, id } = req.body)
    BuildModel.findByIdAndUpdate(id, {
        published: true,
        displayName: title,
        description: description,
        publishDate: new Date(),
        hasImages: true,
    }).lean().then(() => {
        res.sendStatus(200)
    }).catch(err => {
        console.log(err)
        res.sendStatus(500)
    })
})


router.post('/setname', async (req, res) => {
    const packID = req.body.id
    const newName = req.body.displayName
    BuildModel.findByIdAndUpdate(packID, { displayName: newName }).then(() => {
        res.sendStatus(200)
    }).catch(() => res.sendStatus(500))
})

router.post('/new', ensureAuthenticated, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(200)
    }
    const newPack = await BuildModel.create({ build: [], authorUserID: req.user._id, displayName: "New Pack", priceRange: { minPrice: 0, maxPrice: 0 } })
    await UserModel.findByIdAndUpdate(req.user, { activePackId: newPack._id })
    res.sendStatus(200)
})

router.get('/setmain/:packID', ensureAuthenticated, async (req, res) => {
    const packID = req.params.packID
    const userID = req.user._id
    if (!userID)
        return res.sendStatus(401)
    await UserModel.findByIdAndUpdate(userID, { activePackId: packID }).lean()
    res.sendStatus(200)
})
router.post('/delete', async (req, res) => {
    const packID = req.body.id
    await BuildModel.findByIdAndDelete(packID).lean() // Delete Pack
    if (String(packID) === String(req.user.activePackId)) { //If was main pack, change main 
        const newMain = await BuildModel.findOne({ authorUserID: req.user._id }).lean()
        if (newMain)
            await UserModel.findByIdAndUpdate(req.user._id, { activePackId: newMain._id })
    }
    const bParams = {
        Bucket: 'mypackpacker-static',
        Delete: {
            Objects: [
                {Key: `${packID}-preview.png`},
                {Key: `${packID}-full.png`}
            ]
        }
    }
    await s3.deleteObjects(bParams).promise()
    return res.sendStatus(200)
})

module.exports = router