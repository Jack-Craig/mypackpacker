const BuildModel = require('../models/Build')
// This is my first ever aggregation so I bet it sucks (Jan 1, 2021)
const agg = (filter, shouldAddUser=false) => new Promise(async (res, rej) => {
    let pipeline = [
        { $match: filter },
        { $unwind: {path:'$build', preserveNullAndEmptyArrays: true} },
        { $lookup: { from: 'products', localField: 'build', foreignField: '_id', as: 'build' } },
        { $unwind: {path:'$build',preserveNullAndEmptyArrays: true}},
        { $set: { tCat: '$build.categoryID' } },
        { $group: { _id: { tCat: '$tCat', _id: '$_id' }, p: { $first: '$$ROOT' }, v: { $push: '$build' } } },
        { $project: {_id:1, p:1, kv: {$cond: [{$ne:['$v',[]]}, { k: '$_id.tCat', v: '$v' }, []]}}},
        { $group: { _id: '$p._id', p: { $first: '$p' }, kv: { $push: '$kv' } } },
        { $replaceRoot: { newRoot: { $mergeObjects: ['$p', { build: {$cond: [{$ne:['$kv',[[]]]}, {$arrayToObject: '$kv'},[]] } }] } } },
        { $unset: 'tCat'}
    ]
    if (shouldAddUser) {
        pipeline.push({$lookup: {from: 'users', localField: 'authorUserID', foreignField: '_id', as: 'authorUserObj'}})
        pipeline.push({$unwind: '$authorUserObj'})
    }
    BuildModel.aggregate(pipeline).then(res).catch(rej)
})
module.exports = agg