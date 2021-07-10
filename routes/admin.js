const router = require('express').Router()
const UserModel = require('../models/user')
const ProductModel = require('../models/Product')
const BuildModel = require('../models/Build')
const SessionsModel = require('../models/SessionModel')
const ImageModel = require('../models/Image')
const ensureAdmin = require('../helpers/auth').ensureAdmin
const MessageModel = require('../models/Message')
const AnalyticsModel = require('../models/Analytics')

const MASTER_ANALYTICS_KEY = '5ff66a771a950d372db999b0'
const AnalyticsHistoryRange = 4500

router.get('/', ensureAdmin, async (req, res) => {
    Promise.all([
        UserModel.aggregate([
            {
                $lookup: {
                    from: 'sessions',
                    let: {'cId':'$_id'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$user', '$$cId']}}},
                        {$sort: {lastAction: -1}},
                        {$limit: 1}
                    ],
                    as: 'session'
                }
            },            
            { $unwind: { path: '$session', preserveNullAndEmptyArrays: true } }
        ]),
        ImageModel.countDocuments().lean(),
        MessageModel.find({ isAdminMessage: true }).lean(),
        AnalyticsModel.findById(MASTER_ANALYTICS_KEY).lean(),
        SessionsModel.countDocuments({lastAction: {$gt: Date.now() - (1000 * 10 * 60)}}),
        SessionsModel.countDocuments({lastAction: {$gt: Date.now() - (1000 * 60 * 60 * 24)}}),
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
            liveUsers: results[4],
            dailyActive: results[5],
            analyticsHistory: a
        }
        res.render('admin', { user: req.user, data: data, pageTitle: 'Admin' })
    })
})

router.delete('/users', ensureAdmin, async (req, res) => {
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

router.post('/gear', ensureAdmin, async (req, res) => {
    // Search for gear items
    let query = {}
    if (req.body.category !== 'any')
        query.categoryID = req.body.category
    if (req.body.brand !== 'any')
        query.brand = req.body.brand
    if (req.body.qs !== '')
        query.$search = req.body.qs

    const aps = await ProductModel.find(query).lean()
    res.send({gearItems: aps})
})

module.exports = router