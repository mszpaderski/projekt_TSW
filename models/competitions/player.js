var mongoose = require('mongoose');
 
module.exports = mongoose.model('Player',{
    starting_num: Number,
    horse_id: String,
    group_id: String,
    grade_id: String
});
 