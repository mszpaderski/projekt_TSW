var express = require('express');
var router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    methodOverride = require('method-override'); //used to manipulate POST
    bodyParser = require('body-parser'); //parses information from POST
    //Admin = require('../models/Admin');
var bCrypt = require('bcrypt-nodejs');
    
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
    
var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
};

module.exports = function(passport){

	/* GET login page. */
	//For Admin
    router.get('/admin_p/login', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('panel_a/login_admin_p');
	});
    //For Judge
    router.get('/judge_p/login', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('panel_j/login_judge_p');
	});

	/* Handle Login POST */
    //For Admin
	router.post('/admin_p/login', passport.authenticate('login_admin', {
		successRedirect: '/admin_p',
		failureRedirect: '/admin_p/login',
		failureFlash : true  
	}));
    //For Judge
	router.post('/judge_p/login', passport.authenticate('login_judge', {
		successRedirect: '/judge_p',
		failureRedirect: '/judge_p/login',
		failureFlash : true  
	}));
    
    
	/* GET Registration Page for Admin */
	router.get('/admin_p/signup', roles.can('admin_p'), function(req, res){
		res.render('panel_a/register_admin');
	});

	/* Handle Registration for Admin POST */
	router.post('/admin_p/signup', passport.authenticate('signup_admin', {
		successRedirect: '/admin_p/all',
		failureRedirect: '/admin_p/signup',
		failureFlash : true  
	}));
    
    	/* GET Registration Page for Judge */
	router.get('/judge_p/signup', roles.can('admin_p'), function(req, res){
		res.render('panel_j/register_judge');
	});

	/* Handle Registration for Judge POST */
	router.post('/judge_p/signup', passport.authenticate('signup_judge', {
		successRedirect: '/judge_p',
		failureRedirect: '/judge_p/signup',
		failureFlash : true  
	}));

	/* Handle Logout */
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

router.route('/admin_p/all').get( roles.can('admin_p'), function(req, res, next) {
    //retrieve all admins from Mongo
    mongoose.model('Admin').find({}, function (err, admins) {
        if (err){
            return console.error(err);
        } else {
            res.format({
                html: function(){
                    res.render('panel_a/all',{
                        title: 'Lista administratorów',
                        "admins" : admins
                    });
                },
                json: function(){
                     res.json(infophotos);
                }
            });
        }
    });
});
    
router.route('/judge_p/all').get( roles.can('admin_p'), function(req, res, next) {
    //retrieve all judges from Mongo
    mongoose.model('Judge').find({}, function (err, judges) {
        if (err){
            return console.error(err);
        } else {
            res.format({
                html: function(){
                    res.render('panel_j/all',{
                        title: 'Lista sędziów',
                        "judges" : judges
                    });
                },
                json: function(){
                     res.json(infophotos);
                }
            });
        }
    });
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

//Showing admin info
router.route('/admin_p/:id')
  .get( roles.can('admin_p'), function(req, res) {
    mongoose.model('Admin').findById(req.id, function (err, admin) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + admin._id);
        res.format({
          html: function(){
              res.render('panel_a/show', {
                "admin" : admin
              });
          },
          json: function(){
              res.json(admin);
          }
        });
      }
    });
  });
    
//Showing judge info
router.route('/judge_p/:id')
  .get( roles.can('admin_p'), function(req, res) {
    mongoose.model('Judge').findById(req.id, function (err, judge) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + judge._id);
        res.format({
          html: function(){
              res.render('panel_j/show', {
                "judge" : judge
              });
          },
          json: function(){
              res.json(judge);
          }
        });
      }
    });
  });


//GET the individual admin by Mongo ID
router.get('/admin_p/:id/edit', roles.can('admin_p'), function(req, res) {
    //search for the admin within Mongo
    mongoose.model('Admin').findById(req.id, function (err, admin) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the admin
            console.log('GET Retrieving ID: ' + admin._id);
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('panel_a/edit', {
                          title: 'Admin ' + admin._id,
                          "admin" : admin
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(admin);
                 }
            });
        }
    });
});
//GET the individual judge by Mongo ID
router.get('/judge_p/:id/edit', roles.can('admin_p'), function(req, res) {
    //search for the judge within Mongo
    mongoose.model('Judge').findById(req.id, function (err, judge) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the admin
            console.log('GET Retrieving ID: ' + judge._id);
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('panel_j/edit', {
                          title: 'Judge ' + judge._id,
                          "judge" : judge
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(judge);
                 }
            });
        }
    });
});



//PUT to update a admin by ID
router.put('/admin_p/:id/edit', function(req, res) {
    // Get form values
    var username = req.body.username;
    var password = createHash(req.body.password);

   //find the document by ID
        mongoose.model('Admin').findById(req.id, function (err, admin) {
            //update it
            admin.update({
                username : username,
                password : password,
            }, function (err, adminID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML respond
                      res.format({
                          html: function(){
                               res.redirect("/admin_p/" + admin._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(admin);
                         }
                      });
               }
            });
        });
});
    
    //PUT to update a judge by ID
router.put('/judge_p/:id/edit', function(req, res) {
    // Get form values
    var username = req.body.username;
    var password = createHash(req.body.password);
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;

   //find the document by ID
        mongoose.model('Judge').findById(req.id, function (err, judge) {
            //update it
            judge.update({
                username : username,
                password : password,
                firstName : firstName,
                lastName : lastName
            }, function (err, judgeID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML respond
                      res.format({
                          html: function(){
                               res.redirect("/judge_p/" + judge._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(judge);
                         }
                      });
               }
            });
        });
});


//DELETE a admin by ID
router.delete('/admin_p/:id/edit', roles.can('admin_p'), function (req, res){
    //find admin by ID
    mongoose.model('Admin').findById(req.id, function (err, admin) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            admin.remove(function (err, admin) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + admin._id);
                    res.format({
                        //HTML returns us back
                          html: function(){
                               res.redirect("/admin_p/all");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : admin
                               });
                         }
                      });
                }
            });
        }
    });
});
    
//DELETE a judge by ID
router.delete('/judge_p/:id/edit', roles.can('admin_p'), function (req, res){
    //find judge by ID
    mongoose.model('Judge').findById(req.id, function (err, judge) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            judge.remove(function (err, judge) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + judge._id);
                    res.format({
                        //HTML returns us back
                          html: function(){
                               res.redirect("/judge_p/all");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : judge
                               });
                         }
                      });
                }
            });
        }
    });
});
    
        // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
    
	return router;
};






