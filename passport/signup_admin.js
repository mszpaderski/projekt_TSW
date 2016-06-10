/* jshint node: true */
"use strict";

var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admin');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('signup_admin', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            var findOrCreateAdmin = function(){
                // find a Admin in Mongo with provided admin_id
                Admin.findOne({ 'username' :  username }, function(err, admin) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    // already exists
                    if (admin) {
                        console.log('Admin already exists with admin_id: '+ admin._id);
                        return done(null, false, req.flash('message','Admin Already Exists'));
                    } else {
                        // if there is no admin with that admin_id
                        // create the admin
                        var newAdmin = new Admin();

                        // set the admin's local credentials
                        newAdmin.username = username;
                        newAdmin.password = createHash(password);                                         
                        newAdmin.role = 'admin';

                        // save the admin
                        newAdmin.save(function(err) {
                            if (err){
                                console.log('Error in Saving Admin: '+err);  
                                throw err;  
                            }
                            console.log('Admin Registration succesful');    
                            return done(null, req.user);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateAdmin and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateAdmin);
        })
    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};
