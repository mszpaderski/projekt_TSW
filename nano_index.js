var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');


var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var socketIo = require('socket.io');
var passportSocketIo = require('passport.socketio');


//viev engine setup
app.disable('x-powered-by');
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//flash conf
var flash = require('connect-flash');
app.use(flash());


//Database conf:
//Mongoose API connection
var dbConfig = require('./db.js');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);
//Passport conf:
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({
    secret: 'KeyToKingdome',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
//Passport initialize
var initPassport_Admin = require('./passport/init_admin');
var initPassport_Judge = require('./passport/init_judge');
initPassport_Admin(passport);
initPassport_Judge(passport);

//routes/index.js for passport login 
var routes = require('./routes/index')(passport);
app.use('/', routes);


// server
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));


//Checking authentication
function isAdmin(id_check){
    if (id_check.charAt(0) === 'a'){
        return true;
    }else {
        return false;
    }
}
function isJudge(id_check){
    if (id_check.charAt(0) === 'j'){
        return true;
    }else {
        return false;
    }
}

//Authentication for admins
function ensureOnlyAdmin(req, res, next){
    if (isAdmin(req.sessionID)) {return next(); }
    res.redirect('/admin_p/login')
}
//Authentication for judges
function ensureOnlyJudge(req, res, next){
    if (isJudge(req.sessionID)) {return next(); }
    res.redirect('/judge_p/login')
}


//redirecters
app.get('/', function(req, res){
   res.render('home'); 
});

app.get('/watcher_p', function(req, res){
   res.render('watcher_p'); 
});

//app.get('/admin_p', ensureOnlyAdmin, function(req, res){
app.get('/admin_p', function(req, res){
   res.render('admin_p'); 
});

//app.get('/judge_p', ensureOnlyJudge, function(req, res){
app.get('/judge_p', function(req, res){
   res.render('judge_p'); 
});


//błędy 404/500
app.use(function(req, res){
    res.type('text/html')
    res.status(404);
    res.render('404');
});

app.use(function(req, res){
    res.type('text/html')
    res.status(500);
    res.render('500');
});


//nasłuchiwanie serwera
app.listen(app.get('port'), function(){
    console.log('Server nasłuchuje na porcie:' + app.get('port'))
});