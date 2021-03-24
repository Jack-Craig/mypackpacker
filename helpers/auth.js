const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/login');
}

const ensureAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.accessLevel == 11)
            return next()
    }
    res.redirect('/404')
}

module.exports.ensureAuthenticated = ensureAuthenticated
module.exports.ensureAdmin = ensureAdmin