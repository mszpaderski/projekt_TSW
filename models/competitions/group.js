var mongoose = require('mongoose');
 
module.exports = mongoose.model('Group',{
    group_num: Number,
    players: [String],
    sex: String,
    competition_id: String
});
 