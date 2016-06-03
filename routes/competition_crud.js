var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
var Competition = require('../models/competition'),
    Player = require('../models/competitions/player'),
    Group = require('../models/competitions/group');
    Judge = require('../models/judge');

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
                     res.json(infophotos);
                }
            });
        }
    });
}).post(function(req, res) { //POST a new competition
    var name = req.body.name;
    var competition_date = req.body.competition_date;
    var password = req.body.password;
    var judge_val = req.body.judge_val;
    var judge_list = [String];
    for( var i=0; i < judge_val; i++ ){
        judge_list[i] = i;
    }
    //calling create function for Mongo
    mongoose.model('Competition').create({
        name : name,
        competition_date: competition_date,
        password: password,
        judge_val: judge_val,
        judge_list: judge_list
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

//Showing competition info
router.route('/:id')
  .get( roles.can('admin_p'), function(req, res) {
    mongoose.model('Competition').findById(req.id, function (err, competition) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + competition._id);
        res.format({
          html: function(){
              res.render('competitions/show', {
                "competition" : competition
              });
          },
          json: function(){
              res.json(competition);
          }
        });
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
    var judge_list = [String];

   //find the document by ID
        mongoose.model('Competition').findById(req.id, function (err, competition) {
            for(var i=0;i<competition.judge_val;i++){
                judge_list[i] = req.body.judge_list[i]; 
            }
            //update it
            competition.update({
                judge_list: judge_list,
            }, function (err, competitionID) {
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


module.exports = router;