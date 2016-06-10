/* jshint node: true */
"use strict";

var LocalStrategy   = require('passport-local').Strategy;
var Judge = require('../models/judge');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('login_judge', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if a judge with username exists or not
            Judge.findOne({ 'username' :  username }, 
                function(err, judge) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!judge){
                        console.log('Judge Not Found with username '+username);
                        return done(null, false, req.flash('message', 'Judge Not found.'));                 
                    }
                    // Judge exists but wrong password, log the error 
                    if (!isValidPassword(judge, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    // Judge and password both match, return judge from done method
                    // which will be treated like success
                    return done(null, judge);
                }
            );

        })
    );


    var isValidPassword = function(judge, password){
        return bCrypt.compareSync(password, judge.password);
    };
    
};
