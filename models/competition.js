var mongoose = require('mongoose');
 
module.exports = mongoose.model('Competition',{
    name: String,
    competition_date: { type: Date, default: Date.now },
    password: String,
    judge_val: Number,
    judge_list: [],
    starting_list: [],
    groups: []
    
});
 