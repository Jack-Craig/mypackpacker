const mongoose = require('mongoose')

const SourceModel = mongoose.model('sources', new mongoose.Schema({
    _id: String
}, { collection: 'sources', strict: false}))

module.exports = SourceModel