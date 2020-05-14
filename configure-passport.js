'use strict';

// Passport Strategy configuration

const passport = require("passport");
const passportLocal = require("passport-local");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

passport.serializeUser((user, callback) => {
    callback(null, user._id);
});

passport.deserializeUser((id, callback) => {
    User.findById(id)
        .then((user) => {
            callback(null, user);
        })
        .catch((error) => {
            callback(error);
        });
});

const PassportLocalStrategy = passportLocal.Strategy;

passport.use(
    "sign-up", 
    new PassportLocalStrategy({}, (username, password, callback) => {
        bcrypt
            .hash(password, 12)
            .then((hashAndSalt) => {
                return User.create({
                    username, 
                    passwordHash = hashAndSalt
                });
            })
            .catch((error) => {
                callback(error);
            });
    })
);