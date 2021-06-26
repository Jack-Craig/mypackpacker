const mongoose = require('mongoose')

const SessionModel = mongoose.model('session', new mongoose.Schema({
    _id: String,
    expires: Date,
    session: String,
    activePackId: mongoose.Schema.Types.ObjectId,
    lastAction: Date,
    user: mongoose.ObjectId,
}, { collection: 'sessions', strict: false }))

module.exports = SessionModel