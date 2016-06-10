/* jshint node: true */
"use strict";

var mongoose = require('mongoose');
 
module.exports = mongoose.model('Judge_c',{
    judge_id: String,
    competition_id: String
});
 