var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport){

	/* GET login page. */
	//For Admin
    router.get('/admin_p/login', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('login_admin_p', { message: req.flash('message') });
	});
    //For Judge
    router.get('/judge_p/login', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('login_judge_p', { message: req.flash('message') });
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
    
    
	/* GET Registration Page for Judge */
	router.get('/judge_p/signup', function(req, res){
		res.render('register_judge',{message: req.flash('message')});
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

	return router;
}






