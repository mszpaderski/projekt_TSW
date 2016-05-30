var mongoose = require('mongoose');
 
module.exports = mongoose.model('Horse',{
    id: String,
    name: String,
    sex: Boolean,
    breeder: String;
});
 