var mongoose = require('mongoose');
 
module.exports = mongoose.model('Judge',{
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    role: String
});
 