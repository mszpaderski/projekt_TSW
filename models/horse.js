var mongoose = require('mongoose');
 
module.exports = mongoose.model('Horse',{
    name: String,
    sex: Boolean,
    breeder: String
});
 