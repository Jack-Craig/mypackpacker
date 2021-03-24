var express = require('express')
var router = express.Router()
const _ = require('lodash')
const SubCategoryModel = require('../models/SubCategory')
const CategoryModel = require('../models/Category')
const BuildModel = require('../models/Build')
const BuildAgg = require('../helpers/aggregatePack')
const ObjectId = require('mongoose').Types.ObjectId

// define the home page route
router.get('/:packID', function (req, res) {
    Promise.all([
        CategoryModel.find().lean(),
        SubCategoryModel.find().lean(),
        BuildAgg({_id:ObjectId(req.params.packID)})
    ]).then(cats => {
        categories = cats[0]
        subCategories = cats[1]
        buildData = cats[2]
        for (cat of categories) {
            for (i in cat.subCategories) {
                cat.subCategories[i] = _.find(subCategories, (c) => c._id === cat.subCategories[i])
            }
        }
        if (buildData.length) {
            res.render('build', {categoryList: categories, buildData: buildData[0], user: req.user, editable: false})
        } else {
            res.render('404', {user: req.session.user})
        }
    }).catch(e => {
        console.log(e)
        res.sendStatus(500)
    })
})

module.exports = router