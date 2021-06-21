const typeQueryConv = {
    'list': v => {const [v1,v2] = v.split(',');return {'$gte': parseFloat(v1), '$lte': parseFloat(v2)}},
    'bool': v => {return {v}},
    'inter': v => {const l = v.split(',');return{$elemMatch:{$in: l}}},
    'in': v => {
        if (v === '*') {
            return {$exists: true}
        }
        const l = v.split(',')
        return{$in:l}
    },
    'tex': v => {return {$search: v}}
}
class FilterGenerator {
    constructor(categoryData, hardFilters, reqQuery) {
        this.filter_ = {}
        this.reqQuery_ = reqQuery
        for (const filter of categoryData.filters) {
            this.storeFilter(filter)
        }
        for (const filter of hardFilters) {
            this.storeFilter(filter)
        }
    }

    storeFilter (filterObj) {
        const filterKey = filterObj.vsKey
        const fAttr = filterObj.key
        if (this.reqQuery_.hasOwnProperty(filterKey)) {            
            this.filter_[fAttr] = typeQueryConv[filterObj.t](this.reqQuery_[filterKey])
        } else if (filterObj.dflt != undefined && filterObj.dflt != null) {
            this.filter_[fAttr] = typeQueryConv[filterObj.t](filterObj.dflt)
        }
    }

    toMongo() {
        return this.filter_
    }
}

module.exports = FilterGenerator