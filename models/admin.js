/* jshint node: true */
"use strict";

var mongoose = require('mongoose');
 
module.exports = mongoose.model('Admin',{
    username: String,
    password: String,
    role: String
});
 