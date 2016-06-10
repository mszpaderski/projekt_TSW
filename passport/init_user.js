/* jshint node: true */
"use strict";

var login_admin = require('./login_admin');
var signup_admin = require('./signup_admin');
var login_judge = require('./login_judge');
var signup_judge = require('./signup_judge');
var Admin = require('../models/admin');
var Judge = require('../models/judge');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        Admin.findById(id, function(err, user) {
            if(err) done(err);
             if(user){
                console.log('deserializing user:',user);
                done(err, user);
             } else {
                 Judge.findById(id, function(err, user){
                     if(err) done(err);
                     done(null, user);
                 });
             }
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login_admin(passport);
    signup_admin(passport);
    login_judge(passport);
    signup_judge(passport);

};
