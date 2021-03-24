const mongoose = require('mongoose')

const BuildModel = mongoose.model('builds', new mongoose.Schema({
    sessionID: {type: String, required:false},
    authorUserID: mongoose.Schema.Types.ObjectID,
    active: Boolean,
    priceRange: {},
    displayName: String,
    build: [],
    published: {type: Boolean, default: false},
    publishDate: {type: Date, required: false},
    description: {type: String, default: ''},
    hasImages: {type: Boolean, default: false},
    upvotes: {type: Number, default: 0},
    baseWeight: {type: Number, default: 0},
    wornWeight: {type: Number, defualt: 0},
    totalWeight: {type: Number, default: 0},
    dateCreated: {type: Date, default: Date.now}
}, {collection: 'builds'}))

module.exports = BuildModel