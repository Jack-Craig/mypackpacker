require('dotenv').config()
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const mongoStore = require('connect-mongo')(session)
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const _ = require('lodash')
const passport = require('passport')
const app = express()

require('./helpers/passport')(passport)
const priceRangeHelpers = require('./helpers/priceRange')
const uomHelpers = require('./helpers/uom')

const port = process.env.PORT || '3000'

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2592000000 },
    store: new mongoStore({
        mongooseConnection: mongoose.connection,
        collection: 'sessions'
    })
}))

app.use((req, res, next) => {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}
)
app.use(express.static(__dirname + '/public', { maxAge: process.env.NODE_ENV === "development" ? '0' : '60000' }))
app.use(bodyParser.json());
app.use(express.urlencoded({
    extended: true
}))

app.use(cookieParser())
app.set('trust proxy', 1) // trust first proxy

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Prepare handlebars (.fuck)
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/',
    extname: '.hbs',
    defaultLayout: 'index',
    helpers: {
        assign: (varName, varVal, options) => {
            if (!options.data.root) {
                options.data.root = {}
            }
            options.data.root[varName] = varVal
        },
        getLast: priceRangeHelpers.getLast,
        getDisplayPrice: priceRangeHelpers.getDisplayPrice,
        formatPriceInfo: priceRangeHelpers.formatPriceInfo,
        getFormattedMinPrice: priceRangeHelpers.getFormattedMinPrice,
        formatMinPrice: priceRangeHelpers.formatMinPrice,
        getFormattedPriceNoSplit: priceRangeHelpers.getFormattedPriceNoSplit,
        lower: a => a.toLowerCase(),
        lookup: (obj, key) => {
            if (!obj) {
                return false
            }
            key = String(key).split('.')
            for (const k of key)
                obj = obj[k]
            return obj
        },
        dlookup: (obj, keyPath) => {
            if (!obj)
                return false
            const keys = keyPath.split('.')
            let cNode = obj
            for (const key of keys) {
                cNode = cNode[key]
            }
            return cNode
        },
        length: (obj) => {
            if (obj)
                return obj.length
            return 0
        },
        minus: (a, b) => parseFloat(a) - parseFloat(b),
        plus: (a, b) => parseFloat(a) + parseFloat(b),
        formatDate: (dateObj) => {
            return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`
        },
        gt: (a, b) => parseFloat(a) > parseFloat(b),
        lt: (a, b) => parseFloat(a) < parseFloat(b),
        lte: (a, b) => parseFloat(a) <= parseFloat(b),
        ne: (a, b) => a != b,
        eq: (a, b) => a == b,
        idEq: (a, b) => String(a) === String(b),
        range: a => {
            b = []
            for (let i = 0; i < a; i++) {
                b.push(i)
            }
            return b
        },
        abs: (a) => Math.abs(a),
        json: JSON.stringify,
        and: (a, b) => a && b,
        or: (a, b) => a || b,
        nt: a => !a,
        UOM_ConvertTo: uomHelpers.UOM_ConvertTo,
        getDisplayWeight: uomHelpers.getDisplayWeight,
        typeof: a => typeof a,
        reqDim: (url, dim) => {
            if (url == undefined || url.indexOf('undefined') > 0)
                return ''
            const dIdx = url.indexOf('?size=')
            if (dIdx < 0)
                return url
            return `${url.slice(0, dIdx)}?size=${dim}x${dim}`
        },
        max: a => Math.max(...a),
        getStarCode: product => {
            const b_r = product.productInfo.rating.r
            const floorVal = Math.floor(b_r)
            const f_r = Math.abs(floorVal - b_r)
            const c_r = Math.abs(Math.ceil(b_r) - b_r)
            const m_r = Math.abs(floorVal + .5 - b_r)
            const n_full = floorVal
            let n_empty = 0
            let n_half = 0
            if (c_r < f_r && c_r < m_r)
                n_half = 1 // Half star

            n_empty = 5 - n_full - n_half
            return [n_full, n_half, n_empty]
        },
        tern: (con, o1, o2) => con ? o1 : o2,
        flr: (n, m) => Math.floor(n * m) / m,
        sFlr: n => {
            // Smart floor: Limit to a practical number of decimal places given magnitude of number
            const digitSpan = 3
            let nDigits = 0
            nDigits = n == 0 ? 1 : Math.floor(Math.log10(n) + 1)
            if (nDigits > digitSpan)
                return Math.floor(n)
            return Math.floor(n * Math.pow(10, (digitSpan - nDigits))) / Math.pow(10, (digitSpan - nDigits))
        },
        urlEncode: encodeURIComponent,
        percentile: v => {
            let lastDigit = String(v)
            let last2Digits = lastDigit.substr(lastDigit.length - 2, 2)
            lastDigit = lastDigit[lastDigit.length - 1]
            switch (last2Digits) {
                case '11': return v + 'th percentile'
                case '12': return v + 'th percentile'
                case '13': return v + 'th percentile'
            }
            switch (lastDigit) {
                case '1': return v + 'st percentile'
                case '2': return v + 'nd percentile'
                case '3': return v + 'rd percentile'
            }
            return v + 'th percentile'
        },
        perc: a => a * 100,
        div: (a, b) => a / b,
        mult: (a, b) => a * b,
        getFirstSentence: a => a.split('.')[0] + '.', // Could do firstIndexOf and then substring, might be better big O
        orExists: (a, b) => a ? a : b,
        uomHistData: (rawHistData, unit) => {
            let rData = {
                bars: rawHistData.bars,
                start: uomHelpers.UOM_ConvertTo(rawHistData.start, 'g', unit),
                partitionWidth: uomHelpers.UOM_ConvertTo(rawHistData.partitionWidth, 'g', unit),
            }
            return rData
        },
        removeMetaText: t => {
            return t.replace(/\([\s\S]*\)*/g, '')
        },
        isOdd: v => v % 2 != 0
    }
}));

app.set('view engine', 'hbs');

app.use('/', require('./routes/home'))
app.use('/packs', require('./routes/packs'))
app.use('/pack', require('./routes/build'))
app.use('/completed', require('./routes/completed'))
app.use('/user', require('./routes/user'))
app.use('/api', require('./routes/api'))
app.use('/blog', require('./routes/blog'))
app.use('/help', require('./routes/help'))
app.use('/admin', require('./routes/admin'))
app.use('*', require('./routes/404'))

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Mongo connected')

    }).catch(err => console.error(err))

app.listen(port, () => console.log('App listening on port ' + port))