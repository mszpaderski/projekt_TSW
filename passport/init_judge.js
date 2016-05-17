var login_judge = require('./login_judge');
var signup_judge = require('./signup_judge');
var Judge = require('../models/judge');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(judge, done) {
        console.log('serializing judge: ');console.log(judge);
        done(null, judge._id);
    });

    passport.deserializeUser(function(id, done) {
        Judge.findById(id, function(err, judge) {
            console.log('deserializing judge:',judge);
            done(err, judge);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login_judge(passport);
    signup_judge(passport);

}
