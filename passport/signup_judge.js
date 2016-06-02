var LocalStrategy = require('passport-local').Strategy;
var Judge = require('../models/judge');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('signup_judge', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            var findOrCreateJudge = function(){
                // find a Judge in Mongo with provided username
                Judge.findOne({ 'username' :  username }, function(err, judge) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    // already exists
                    if (judge) {
                        console.log('Judge already exists with username: '+username);
                        return done(null, false, req.flash('message','Judge Already Exists'));
                    } else {
                        // if there is no judge with that email
                        // create the judge
                        var newJudge = new Judge();

                        // set the judge's local credentials
                        newJudge.username = username;
                        newJudge.password = createHash(password);
                        newJudge.firstName = req.param('firstName');
                        newJudge.lastName = req.param('lastName');
                        newJudge.role = 'judge';

                        // save the Judge
                        newJudge.save(function(err) {
                            if (err){
                                console.log('Error in Saving Judge: '+err);  
                                throw err;  
                            }
                            console.log('Judge Registration succesful');    
                            return done(null, req.user);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateJudge and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateJudge);
        })
    );


    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

    
    
};
