var mongoose = require('mongoose');
 
module.exports = mongoose.model('Grade',{
    player_id: String,
    kat_1: String,
    kat_2: String,
    kat_3: String,
    kat_4: String,
    kat_5: String
});
 