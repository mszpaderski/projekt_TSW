var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
var Horse = require('../models/horse');

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
    //retrieve all horses from Mongo
    mongoose.model('Horse').find({}, function (err, horses) {
        if (err){
            return console.error(err);
        } else {
            res.format({
                html: function(){
                    res.render('horses/all',{
                        title: 'Lista Koni',
                        "horses" : horses
                    });
                },
                json: function(){
                     res.json(infophotos);
                }
            });
        }
    });
}).post(function(req, res) { //POST a new horse
    var name = req.body.name;
    var sex;
    if(req.body.sex === "on"){
        sex = "ogier";
    } else {
        sex = "klacz";
    }
    var breeder = req.body.breeder;
    //calling create function for Mongo
    mongoose.model('Horse').create({
        name : name,
        sex : sex,
        breeder : breeder
    }, function(err, horse) {
        if(err){
            res.send("Błąd przy dodawaniu informacji o koniu do bazy danych");
        } else { //successful create
            console.log('POST creating new Horse: ' + horse);
            res.format({
                html: function(){
                    res.location("all");
                    res.redirect("/horses");
                },
                json: function(){
                    res.json(horse);
                }
            });
        }
    });
});

//GET New horse page
router.get('/new', roles.can('admin_p'), function(req, res) {
    res.render('horses/new', { title: 'Dodaj konia'});
});


//route middleware to validate id
router.param('id', function(req, res, next, id) {
    //find ID in the DB
    mongoose.model('Horse').findById(id, function(err, horse){
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

//Showing horse info
router.route('/:id')
  .get( roles.can('admin_p'), function(req, res) {
    mongoose.model('Horse').findById(req.id, function (err, horse) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + horse._id);
        res.format({
          html: function(){
              res.render('horses/show', {
                "horse" : horse
              });
          },
          json: function(){
              res.json(horse);
          }
        });
      }
    });
  });


//GET the individual horse by Mongo ID
router.get('/:id/edit', roles.can('admin_p'), function(req, res) {
    //search for the horse within Mongo
    mongoose.model('Horse').findById(req.id, function (err, horse) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the horse
            console.log('GET Retrieving ID: ' + horse._id);
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('horses/edit', {
                          title: 'Horse ' + horse._id,
                          "horse" : horse
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(horse);
                 }
            });
        }
    });
});



//PUT to update a horse by ID
router.put('/:id/edit', function(req, res) {
    // Get form values
    var name = req.body.name;
    var sex;
    if(req.body.sex === "on"){
        sex = "ogier";
    } else {
        sex = "klacz";
    }
    var breeder = req.body.breeder;

   //find the document by ID
        mongoose.model('Horse').findById(req.id, function (err, horse) {
            //update it
            horse.update({
                name : name,
                sex : sex,
                breeder : breeder,
            }, function (err, horseID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML respond
                      res.format({
                          html: function(){
                               res.redirect("/horses/" + horse._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(horse);
                         }
                      });
               }
            });
        });
});


//DELETE a horse by ID
router.delete('/:id/edit', roles.can('admin_p'), function (req, res){
    //find horse by ID
    mongoose.model('Horse').findById(req.id, function (err, horse) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            horse.remove(function (err, horse) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + horse._id);
                    res.format({
                        //HTML returns us back
                          html: function(){
                               res.redirect("/horses");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : horse
                               });
                         }
                      });
                }
            });
        }
    });
});


module.exports = router;