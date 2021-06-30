const express = require('express')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const router = express.Router()
const passport = require('passport')
const UserModel = require('../models/user')
const BuildModel = require('../models/Build')
const SubCategoryModel = require('../models/SubCategory')
const ProductModel = require('../models/Product')
const ImageModel = require('../models/Image')
const TempUIDModel = require('../models/TempUID')
const MQ = require('../helpers/rsmqLoader')
const ensureAuthenticated = require("../helpers/auth").ensureAuthenticated
const SessionModel = require('../models/SessionModel')


router.use('/packs', require('./subroutes/userpacks'))

// Rendering Routes
router.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') })
})

router.get('/signup', (req, res) => {
    res.render('signup')
})

router.get('/account', ensureAuthenticated, async (req, res) => {
    res.render('account', { user: req.user })
})

router.get('/forgot', async (req, res) => {
    if (req.user)
        return res.render('404', { user: req.user })
    res.render('forgot', { success: req.query.success })
})

router.get('/account/reset/:uid', async (req, res) => {
    if (req.user)
        return res.render('404', { user: req.user })
    const uid_key = req.params.uid
    // Check if valid
    const tUID = await TempUIDModel.findOne({ tempId: uid_key }).lean()
    if (tUID) {
        const user = await UserModel.findById(tUID._id).lean()
        res.render('passwordReset', { user: null, tempUser: user, uid: tUID.tempId })
    } else {
        res.render('passwordReset', { user: req.user, tempUser: null, success: req.query.success })
    }
})

// Back-End Auth Routes
router.post('/login', passport.authenticate('local', { failureRedirect: '/user/login', failureFlash: true }), async (req, res) => {
    if (req.isAuthenticated()) {
        await moveSessionBuildToUser(req.sessionID, req.user)
        res.redirect('/')
    } else {
        res.redirect('/user/login')
    }
})

router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/user/login', failureFlash: true }),
    async (req, res) => {
        // Successful authentication, redirect home.
        if (req.isAuthenticated()) {
            await moveSessionBuildToUser(req.sessionID, req.user)
            res.redirect('/')
        } else {
            res.redirect('/user/login')
        }
    });

router.get('/logout', (req, res) => {
    req.logout()
    req.user = null;
    res.user = null;
    req.session.destroy(function () {
        res.clearCookie('connect.sid')
        res.redirect('/')
    });

})

router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body
    const sameCheck = await UserModel.findOne({ $or: [{ username: username }, { email: email }] }).lean()
    if (sameCheck) {
        let errors = []
        if (sameCheck.email === email) {
            if (sameCheck.hasOwnProperty('googleID'))
                errors.push('Sign in with Google on this account')
            else
                errors.push('Email already in use')
        }
        if (sameCheck.username === username) {
            errors.push('Username already in use')
        }
        return res.render('signup', { errors: errors })
    }
    const pwd = await bcrypt.hash(req.body.password, 10)
    UserModel.create({
        username: req.body.username,
        password: pwd,
        email: req.body.email
    }).then(async user => {
        req.login(user, async err => {
            if (req.isAuthenticated()) {
                await moveSessionBuildToUser(req.sessionID, user)
                res.redirect('/')
            } else {
                res.redirect('/user/login')
            }
        })
    })
})

router.post('/account/reset', async (req, res) => {
    if (req.body.pass1 !== req.body.pass2)
        return res.send({ error: true, errorMessage: 'NoMatch' })
    if (!req.body.pass1.length)
        return res.send({ error: true, errorMessage: 'EmptyField' })
    // Ensure tUID exists (either exploitive or expired while on page)
    let tempUid = null
    try {
        tempUid = await TempUIDModel.findOne({ tempId: req.body.tuid }).lean()
    } catch (ex) {
        console.error(ex)
        return res.send({ errpr: true, errorMessage: 'unkn' })
    }
    if (!tempUid)
        return res.send({ error: true, errorMessage: 'NoUid' })
    // Hash pass
    const pwd = await bcrypt.hash(req.body.pass1, 10)
    // Update user
    try {
        await UserModel.findByIdAndUpdate(tempUid._id, { password: pwd }).lean()
    } catch (ex) {
        console.error(ex)
        return res.send({ error: true, errorMessage: 'unkn' })
    }
    // Log out all sessions
    await SessionModel.deleteMany({ user: tempUid._id })
    // Delete tempUid
    await TempUIDModel.findByIdAndDelete(tempUid._id).lean()
    return res.send({ error: false })
})

router.post('/account/requestReset', async (req, res) => {
    if (!req.body.email.length)
        return res.send({ error: true, errorMessage: 'NoEmail' })
    MQ.rsmq.sendMessage({
        qname: MQ.queueName,
        message: JSON.stringify({
            isWorkerMessage: true,
            isAdminMessage: false,
            type: 'passwordReset',
            targets: [],
            content: req.body.email
        })
    }, (err, cbV) => {
        if (err) {
            console.error(err)
            res.send({ error: true, errorMessage: 'unkn' })
        }
        console.log('Send message')
        res.send({ error: false })
    })
})

router.delete('/', ensureAuthenticated, async (req, res) => {
    const uid = req.user._id

    // Delete all user uploaded images
    await ImageModel.deleteMany({ uploaderID: uid }).lean()
    // Delete all user created packs
    await BuildModel.deleteMany({ authorUserID: uid }).lean()
    // Delete all user added gear ? TODO: Decide if this should actually happen

    // Delete user document
    await UserModel.findByIdAndDelete(uid).lean()
    res.sendStatus(200)
})

// Favorite/Publish related:
router.get('/gear', ensureAuthenticated, (req, res) => {
    const savedGear = req.user.gearListSaved
    const ownedGear = req.user.gearListOwned
    const savedMap = _.reduce(savedGear, (acc, v) => { acc[v] = true; return acc }, {})
    const ownedMap = _.reduce(ownedGear, (acc, v) => { acc[v] = true; return acc }, {})
    const query = { $or: [{ _id: { $in: savedGear } }, { _id: { $in: ownedGear } }] }
    const dbCalls = [
        ProductModel.find(query).lean(),
        SubCategoryModel.find().lean()
    ]
    Promise.all(dbCalls).then(promiseReturns => {
        const gear = promiseReturns[0]
        const categories = promiseReturns[1]
        let savedGearObjs = {}
        let ownedGearObjs = {}
        for (const gItem of gear) {
            if (savedMap[gItem._id]) {
                if (!savedGearObjs.hasOwnProperty(gItem.categoryID))
                    savedGearObjs[gItem.categoryID] = []
                savedGearObjs[gItem.categoryID].push(gItem)
            }
            if (ownedMap[gItem._id]) {
                if (!ownedGearObjs.hasOwnProperty(gItem.categoryID))
                    ownedGearObjs[gItem.categoryID] = []
                ownedGearObjs[gItem.categoryID].push(gItem)
            }
        }
        res.render('gear', { user: req.user, categories: categories, savedGear: savedGearObjs, ownedGear: ownedGearObjs })
    }).catch(e => {
        console.log(e)
        res.sendStatus(500)
    })
})

router.post('/gear/add', ensureAuthenticated, (req, res) => {
    const forOwned = req.body.owned ? req.body.owned : []
    const forSaved = req.body.saved ? req.body.saved : []
    UserModel.findByIdAndUpdate(req.user._id, {
        $push: {
            gearListOwned: { $each: forOwned },
            gearListSaved: { $each: forSaved }
        }
    }).lean().then(() => res.sendStatus(200)).catch(e => {
        console.log(e)
        res.sendStatus(500)
    })
})

router.post('/gear/remove', ensureAuthenticated, (req, res) => {
    const forOwned = req.body.owned ? req.body.owned : []
    const forSaved = req.body.saved ? req.body.saved : []

    UserModel.findByIdAndUpdate(req.user._id, {
        $pullAll: {
            gearListOwned: forOwned,
            gearListSaved: forSaved
        }
    }).then(() => { res.sendStatus(200) }).catch(e => {
        console.log(e)
        res.sendStatus(200)
    })
})

router.post('/preferences', ensureAuthenticated, async (req, res) => {
    // TODO: Validate entries
    UserModel.findByIdAndUpdate(req.user._id, req.body).lean().then(() => res.sendStatus(200)).catch(e => {
        console.log(e)
        res.sendStatus(500)
    })
})

// Helpers:

const moveSessionBuildToUser = async (sessionID, user) => {
    const pack = await BuildModel.findOne({ sessionID: sessionID }).lean()
    if (pack) {
        await UserModel.findByIdAndUpdate(user._id, { activePackId: pack._id }).lean()
        await BuildModel.findByIdAndUpdate(pack._id, {
            '$unset': { sessionID: 1 },
            '$set': { authorUserID: user._id }
        }).lean()
        return
    }
}

module.exports = router

