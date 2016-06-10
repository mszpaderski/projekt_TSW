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
    

//Connect-roles conf:
var connectRoles = require('connect-roles');
var roles = new connectRoles({
    failureHandler: function(req, res, action){
        res.status(403);
        res.render('errors/not_logged');
    }
});
router.use(roles.middleware());

roles.use(function (req, action) {
  if (!req.isAuthenticated()) return action === 'watcher';
});


//Connect-roles judge
roles.use('judge_p', function(req) {
    if (req.user.role === 'judge'){
        return true;
    }
});
//Connect-roles admin
roles.use('admin_p', function(req) {
    if (req.user.role === 'admin'){
        return true;
    }
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method in req.body'){
        //look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

router.route('/').get( roles.can('admin_p'), function(req, res, next) {
    //retrieve all competitions from Mongo
    mongoose.model('Competition').find({}, function (err, competitions) {
        if (err){
            return console.error(err);
        } else {
            res.format({
                html: function(){
                    res.render('competitions/all',{
                        title: 'Lista Zawodów',
                        "competitions" : competitions
                    });
                },
                json: function(){
                     res.json(competitions);
                }
            });
        }
    });
}).post(function(req, res) { //POST a new competition
    var name = req.body.name;
    var competition_date = req.body.competition_date;
    var password = req.body.password;
    var judge_val = req.body.judge_val;
    var player_val = req.body.player_val;
    var group_val = req.body.group_val;
    
    //calling create function for Mongo
    mongoose.model('Competition').create({
        name : name,
        competition_date: competition_date,
        password: password,
        judge_val: judge_val,
        player_val: player_val,
        group_val: group_val
        
    }, function(err, competition) {
        if(err){
            res.send("Błąd przy dodawaniu informacji o zawodach do bazy danych");
        } else { //successful create
            console.log('POST creating new competition: ' + competition);
            res.format({
                html: function(){
                    res.location("all");
                    res.redirect("/competitions/new_j/"+competition._id);//Redirecting to page with Judges to choose
                },
                json: function(){
                    res.json(competition);
                }
            });
        }
    });
});

//GET New competition page
router.get('/new', roles.can('admin_p'), function(req, res) {
    res.render('competitions/new', { title: 'Dodaj zawody'});
});


//route middleware to validate id
router.param('id', function(req, res, next, id) {
    //find ID in the DB
    mongoose.model('Competition').findById(id, function(err, competition){
        if (err){
            console.log(id + 'was not found');
            res.status(404);
            err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            req.id = id;
            next();
        }
    });
});

//VIEWING SPECIFIC
//Showing competition info
router.route('/:id')
  .get( roles.can('admin_p'), function(req, res) {
    mongoose.model('Competition').findById(req.id, function (err, competition) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
          //Return the competition
            mongoose.model('Judge_c').where('competition_id', competition._id).exec(function (err, judge_c){
                if(err){return console.error(err);} else{
                    var judges_id = [''];
                    for( var i = 0; i<judge_c.length; i++){judges_id[i] = judge_c[i].judge_id;}
            mongoose.model('Judge').where('_id').in(judges_id).exec(function (err, judges){
                if(err){return console.error(err);} else{
                mongoose.model('Group').where('competition_id', competition._id).exec(function (err, groups){
                if(err){return console.error(err);} else{
          mongoose.model('Player').where('competition_id', competition._id).exec(function (err, players){
                if(err){return console.error(err);} else{
                    var players_id = [''];
                    for( var i = 0; i<players.length; i++){players_id[i] = players[i].horse_id;}
            mongoose.model('Horse').where('_id').in(players_id).exec(function (err, horses){
                if(err){return console.error(err);} else{
                    res.format({
                            //HTML response will render the 'edit.jade' template
                            html: function(){
                                    res.render('competitions/show', {
                                            "competition" : competition,
                                            "horses" : horses,
                                            "judges" : judges,
                                            "groups" : groups
                                            
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
            }});
                
            }});
          }
        }); 
    });


//ADDING JUDGES
//GET the individual competition by Mongo ID
router.get('/new_j/:id', roles.can('admin_p'), function(req, res) {
    //search for the competition within Mongo
    mongoose.model('Competition').findById(req.id, function (err, competition) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the competition
            mongoose.model('Judge').find({}, function(err, judges){ 
                if(err){return console.error(err);} else{
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('competitions/new_j', {
                          title: 'Dodaj ' + competition.judge_val + ' sędziów: ' + competition._id,
                          "competition" : competition,
                           "judges" : judges
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(competition);
                 }
            });
                }});
        }
    });
});
//PUT to update a competition by ID
router.put('/new_j/:id', function(req, res) {
    // Get form values
   //find the document by ID
        mongoose.model('Competition').findById(req.id, function (err, competition) {
            for(var i=0;i<competition.judge_val;i++){
                mongoose.model('Judge_c').create({
                    judge_id : req.body.judge_list[i],
                    competition_id : competition._id
                });
            }
            //update it
            competition.update({}, function (err, competitionID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML respond
                      res.format({
                          html: function(){
                               res.redirect("/competitions/new_pl/" + competition._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(competition);
                         }
                      });
               }
            });
        });
});

//ADDING PLAYERS!
//GET the individual competition by Mongo ID
router.get('/new_pl/:id', roles.can('admin_p'), function(req, res) {
    //search for the competition within Mongo
    mongoose.model('Competition').findById(req.id, function (err, competition) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the competition
            mongoose.model('Horse').find({}, function(err, horses){ 
                if(err){return console.error(err);} else{
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('competitions/new_pl', {
                          title: 'Dodaj ' + competition.player_val + ' zawodników: ' + competition._id,
                          "competition" : competition,
                           "horses" : horses
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(competition);
                 }
            });
                }});
        }
    });
});
//PUT to update a competition by ID
router.put('/new_pl/:id', function(req, res) {
    // Get form values
   //find the document by ID
        mongoose.model('Competition').findById(req.id, function (err, competition) {
            for(var i=0;i<competition.player_val;i++){
                // save the player
                mongoose.model('Player').create({
                    starting_num : i,
                    horse_id : req.body.player_list[i],
                    competition_id : competition._id,
                });
            }
            //update it
            competition.update({}, function (err, competitionID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML respond
                      res.format({
                          html: function(){
                               res.redirect("/competitions/new_g/" + competition._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(competition);
                         }
                      });
               }
            });
        });
});

//ADDING GROUPS!
//GET the individual competition by Mongo ID
router.get('/new_g/:id', roles.can('admin_p'), function(req, res) {
    //search for the competition within Mongo
    mongoose.model('Competition').findById(req.id, function (err, competition) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the competition
            mongoose.model('Player').where('competition_id', competition._id).select('horse_id').exec(function (err, players){
                if(err){return console.error(err);} else{
                    var horses_id = [''];
                    for( var i = 0; i<players.length; i++){horses_id[i] = players[i].horse_id;}
                    mongoose.model('Horse').where('_id').in(horses_id).exec(function (err, horses){
                        if(err){return console.error(err);} else{
                                res.format({
                            //HTML response will render the 'edit.jade' template
                                    html: function(){
                                           res.render('competitions/new_g', {
                                                 title: 'Dodaj ' + competition.group_val + ' grup z zawodnikami: ' + competition._id,
                                                 "competition" : competition,
                                                 "horses" : horses
                                            });
                                    },
                            //JSON response will return the JSON output
                                    json: function(){
                                            res.json(competition);
                                    }
                                });
                        }});
                }});
        }
    });
});
//PUT to update a competition by ID
router.put('/new_g/:id', function(req, res) {
    // Get form values
   //find the document by ID
        mongoose.model('Competition').findById(req.id, function (err, competition) {
            for(var i=0;i<competition.group_val;i++){
                var players = [];
                for(var n=0; n < competition.player_val ; n++){
                    console.log(req.body.players[i][n]);
                    if(req.body.players[i][n] !== 'none'){
                        players.push(req.body.players[i][n]);
                    }
                }
                // save the player
                mongoose.model('Group').create({
                    group_num : req.body.group_num[i],
                    sex : req.body.sex[i],
                    players : players,
                    competition_id : competition._id
                });
            }
            //update it
            competition.update({}, function (err, competitionID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML respond
                      res.format({
                          html: function(){
                               res.redirect("/competitions/" + competition._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(competition);
                         }
                      });
               }
            });
        });
});



//DELETE a competition by ID
router.delete('/:id/edit', roles.can('admin_p'), function (req, res){
    //find competition by ID
    mongoose.model('Competition').findById(req.id, function (err, competition) {
        if (err) {
            return console.error(err);
        } else {
            //Deleting Player of this competition
            mongoose.model('Player').where('competition_id', competition._id).exec(function (err, players){
                if(err){return console.error(err);} else{
                    for (var i = 0; i<players.length; i++){
                      removeIt(players[i]); 
                      /*  players[i].remove(function (err, players){
                            if(err){return console.error(err);} else{
                                return console.log("Players deleted");
                            }
                        });*/       
            }}});
            //Deleting Judge_c of this competition
            mongoose.model('Judge_c').where('competition_id', competition._id).exec(function (err, judge_cs){
                if(err){return console.error(err);} else{
                  for (var i = 0; i<judge_cs.length; i++){
                      removeIt(judge_cs[i]); 
                    /*judge_cs[i].remove(function (err, judge_cs){
                        if(err){return console.error(err);} else{
                            return console.log("Judges_c deleted");
                        }
                    });*/       
            }}});
            //Deleting Group of this competition
            mongoose.model('Group').where('competition_id', competition._id).exec(function (err, groups){
                if(err){return console.error(err);} else{
                  for (var i = 0; i<groups.length; i++){
                    removeIt(groups[i]); 
                    //groups[i].remove(function (err, groups){
                    //    if(err){return console.error(err);} else{
                    //        return console.log("Groups deleted");
                    //    }
                    //});     
            }}});
            
            //remove it from Mongo
            competition.remove(function (err, competition) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + competition._id);
                    res.format({
                        //HTML returns us back
                          html: function(){
                               res.redirect("/competitions");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : competition
                               });
                         }
                      });
                }
            });
        }
    });
});


	/* STARTING THE COMPETITION */
router.route('/start/:id')
  .get( roles.can('admin_p'), function(req, res) {
    mongoose.model('Competition').findById(req.id, function (err, competition) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
          //Return the competition
            mongoose.model('Judge_c').where('competition_id', competition._id).exec(function (err, judge_c){
                if(err){return console.error(err);} else{
                    var judges_id = [''];
                    for( var i = 0; i<judge_c.length; i++){judges_id[i] = judge_c[i].judge_id;}
            mongoose.model('Judge').where('_id').in(judges_id).exec(function (err, judges){
                if(err){return console.error(err);} else{
                mongoose.model('Group').where('competition_id', competition._id).exec(function (err, groups){
                if(err){return console.error(err);} else{
          mongoose.model('Player').where('competition_id', competition._id).exec(function (err, players){
                if(err){return console.error(err);} else{
                    var players_id = [''];
                    for( var i = 0; i<players.length; i++){players_id[i] = players[i].horse_id;}
            mongoose.model('Horse').where('_id').in(players_id).exec(function (err, horses){
                if(err){return console.error(err);} else{
                    res.format({
                            //HTML response will render the 'edit.jade' template
                            html: function(){
                                    res.render('competitions/start', {
                                            "competition" : competition,
                                            "horses" : horses,
                                            "judges" : judges,
                                            "groups" : groups,
                                            "players" : players,
                                            "judge_c" : judge_c
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
            }});
                
            }});
          }
        }); 
    });

//DELETING FROM DATABASE
var removeIt = function(item){
    
                    item.remove(function (err, item){
                        if(err){return console.error(err);} else{
                            return console.log("Item deleted");
                        }
                    });
};



module.exports = router;