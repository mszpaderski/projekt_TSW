var login_admin = require('./login_admin');
var signup_admin = require('./signup_admin');
var Admin = require('../models/admin');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize admins to support persistent login sessions
    passport.serializeUser(function(admin, done) {
        console.log('serializing admin: ');console.log(admin);
   //     var id_ser = 'a' + admin._id; // Bad use of init admin/judge id
   //     done(null, id_ser);
        done(null, admin._id);
    });

    passport.deserializeUser(function(id, done) {
        Admin.findById(id, function(err, admin) {
            console.log('deserializing admin:',admin);
            done(err, admin);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login_admin(passport);
    signup_admin(passport);

}
