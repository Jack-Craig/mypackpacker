const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcrypt')
const User = require("../models/user")

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
            User.findOne({ $or: [{ username: username }, { email: username }] }).lean().then((user) => {
                if (!user) {
                    return done(null, false, { message: 'Invalid Username or Password' });
                }
                if (user.password == undefined) {
                    // This user signed up using oAuth
                    return done(null, false, { message: 'Use google to sign into this account' })
                }
                //match pass
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Invalid Username or Password' });
                    }
                })
            })
                .catch((err) => { console.error(err) })
        })
    )

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/user/google/callback"
    },
        function (accessToken, refreshToken, profile, cb) {
            User.findOne({ $or: [{ googleID: profile.id }, { email: profile.emails[0].value }] }).lean().then(user => {
                if (!user) {
                    User.create({
                        googleID: profile.id,
                        username: profile.displayName,
                        email: profile.emails[0].value
                    }).then((user) => cb(null, user)).catch((e) => cb(e, user))
                } else {
                    if (user.googleID === undefined)
                        return cb(null, false, { message: 'Account with that email already exists' })
                    cb(null, user);
                }
            }).catch(err => { cb(err, null) })
        }
    ))

    passport.serializeUser(function (user, done) {
        done(null, { _id: user._id })
    });

    passport.deserializeUser(function (user, done) {
        User.findById(user._id).lean().then(u => {
            done(null, u)
        }).catch(e => {
            console.error(e)
            done(e, user)
        })
    })
};