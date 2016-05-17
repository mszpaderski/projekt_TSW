var mongoose = require('mongoose');
 
module.exports = mongoose.model('Admin',{
    id: String,
    admin_id: String,
    password: String,
});
 