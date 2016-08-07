/* jshint node: true */
"use strict";


var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
var Competition = require('../models/competition'),
    Player = require('../models/competitions/player'),
    Group = require('../models/competitions/group'),
    Judge = require('../models/judge'),
    Horse = require('../models/horse'),
    Judge_c = require('../models/competitions/judge_c');
    
router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method in req.body'){
        //look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));


router.route('/show/:id').get(function(req, res) {
    console.log(req.params.id);
   mongoose.model('Competition').findById(req.params.id, function(err, competition){
       if(err){console.log(err);} else{
           console.log(competition);
           mongoose.model('Player').where('competition_id', competition._id).exec(function(err, players){
               if(err){console.log(err);} else{
                   var horse_name = '';
                 mongoose.model('Horse').where().exec(function(err, horsey){
                    if(err){console.log(err);}else{
                   mongoose.model('Group').where('competition_id', competition._id).exec(function(err, groups){
                       if(err){console.log(err);} else{
                           for(var i=0;i<groups.length;i++){
                               for(var n=0;n<groups[i].players.length;n++){
                                   for(var e=0;e<players.length;e++){
                                       if(players[e].horse_id === groups[i].players[n]){
                                           var horse_name = '';
                                           for(var z=0;z<horsey.length;z++){
                                               if(horsey[z]._id == players[e].horse_id){
                                                   horse_name = horsey[z].name;
                                                   console.log(horse_name+' znalazłem konia');
                                                   break;
                                               }
                                           }
                                           players[e].horse_id = horse_name;
                                           groups[i].players[n] = players[e];
                                            console.log('found: ' + groups[i].players[n]);
                                           break;
                                       }else{console.log('not found!!!');}
                                   }
                               }
                               groups[i].players.sort(function(a,b){
                                   return b.final_grade - a.final_grade;
                               });
                           }
                           
                           
                          res.format({
                            //HTML response will render the 'edit.jade' template
                            html: function(){
                                    res.render('panel_w/show_com', {
                                        'competition': competition,
                                        'groups': groups,
                                        
                                        });
                                },
                            //JSON response will return the JSON output
                            json: function(){
                                    res.json(competition);
                                }
                        });
                       }});
                    }});
               }});
        }
   });
});


module.exports = router;