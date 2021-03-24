const router = require('express').Router()
const UserModel = require('../models/user')
const ProductModel = require('../models/Product')
const BuildModel = require('../models/Build')
const ImageModel = require('../models/Image')
const ensureAdmin = require('../helpers/auth').ensureAdmin
const MessageModel = require('../models/Message')
const AnalyticsModel = require('../models/Analytics')

const MASTER_ANALYTICS_KEY = '5ff66a771a950d372db999b0'
const AnalyticsHistoryRange = 4500

router.get('/', ensureAdmin, async (req, res) => {
    Promise.all([
        UserModel.find().lean(),
        ImageModel.countDocuments().lean(),
        MessageModel.find({ isAdminMessage: true }).lean(),
        AnalyticsModel.findById(MASTER_ANALYTICS_KEY).lean(),
    ]).then(async results => { // TODO: Add num packs compilation create pack endpoint
        const a = await AnalyticsModel.find({ entryNumber: { $gt: results[3].numEntries - AnalyticsHistoryRange } }).sort({ entryNumber: 1 }).lean()
        const lA = a[a.length - 1]
        const data = {
            users: results[0],
            numPacks: lA.numPacks,
            numGearItems: lA.numGearItems,
            numSessionPacks: lA.numSessionPacks,
            numImages: results[1],
            messages: results[2],
            analyticsHistory: a
        }
        res.render('admin', { user: req.user, data: data })
    })
})

router.delete('/users', async (req, res) => {
    const usrs = req.query.usrs
    if (!usrs)
        return res.sendStatus(200)
    const userIdList = usrs.split(',')

    // Delete all user images
    await ImageModel.deleteMany({ uploaderID: { $in: userIdList } }).lean()
    // Delete all user packs
    await BuildModel.deleteMany({ authorUserID: { $in: userIdList } }).lean()
    // Delete all user info
    await UserModel.deleteMany({ _id: { $in: userIdList } }).lean()
    res.sendStatus(200)
})

module.exports = router