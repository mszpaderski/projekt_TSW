var mongoose = require('mongoose');
 
module.exports = mongoose.model('Competition',{
    name: String,
    competition_date: { type: Date, default: Date.now },
    password: String,
    judge_val: Number,
    player_val: Number,
    group_val: Number
});
 