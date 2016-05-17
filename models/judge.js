var mongoose = require('mongoose');
 
module.exports = mongoose.model('Judge',{
    id: String,
    username: String,
    password: String,
    firstName: String,
    lastName: String
});
 