/* jshint node: true */
"use strict";

var LocalStrategy   = require('passport-local').Strategy;
var Admin = require('../models/admin');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('login_admin', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 
            // check in mongo if an admin with admin_id exists or not
            Admin.findOne({ 'username' :  username }, 
                function(err, admin) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // admin_id does not exist, log the error and redirect back
                    if (!admin){
                        console.log('Admin Not Found with admin_id '+username);
                        return done(null, false, req.flash('message', 'Admin Not found.'));                 
                    }
                    // Admin exists but wrong password, log the error 
                    if (!isValidPassword(admin, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    // Admin and password both match, return admin from done method
                    // which will be treated like success
                    return done(null, admin);
                }
            );

        })
    );


    var isValidPassword = function(admin, password){
        return bCrypt.compareSync(password, admin.password);
    };
    
};
