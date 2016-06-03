var mongoose = require('mongoose');
 
module.exports = mongoose.model('Group',{
    gruop_num: Number,
    players: [String],
    sex: String
});
 