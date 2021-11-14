const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const mongoose = require('mongoose');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
   done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId).then(user => {
        done(null, user);
    })
});

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
}, (accessToken, refreshToken, profile, done) => {
    console.log(profile.id);
    User.findOne({ googleId: profile.id }).then(existingUser => {
        if (existingUser) {
            console.log('User with googleID ' + profile.id + ' already exists');
            done(null, existingUser);
        } else {
            new User({ googleId: profile.id })
                .save()
                .then(savedUser => {
                    console.log('New user with googleId ' + profile.id + ' saved to DB');
                    done(null, savedUser);
                });
        }
    });
}));