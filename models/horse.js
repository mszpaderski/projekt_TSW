/* jshint node: true */
"use strict";

var mongoose = require('mongoose');
 
module.exports = mongoose.model('Horse',{
    name: String,
    sex: String,
    breeder: String
});
 