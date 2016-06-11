/* jshint node: true */
"use strict";

var mongoose = require('mongoose');
 
module.exports = mongoose.model('Player',{
    starting_num: Number,
    horse_id: String,
    competition_id: String,
    current: Boolean,
    final_grade: Number,
    final_type: Number,
    final_move: Number
});
 