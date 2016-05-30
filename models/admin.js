var mongoose = require('mongoose');
 
module.exports = mongoose.model('Admin',{
    admin_id: String,
    password: String
});
 