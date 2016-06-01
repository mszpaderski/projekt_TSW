var http = require('http');
var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');


var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var socketIo = require('socket.io');
var passportSocketIo = require('passport.socketio');


//viev engine setup
app.disable('x-powered-by');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/*
//handlebars view egine:
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
*/
//Jade view engine setup 
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'jade'); 

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
var initPassport_User = require('./passport/init_user');
initPassport_User(passport);


//Connect-roles conf:
var connectRoles = require('connect-roles');
var roles = new connectRoles({
    failureHandler: function(req, res, action){
        res.status(403);
        res.render('errors/not_logged');
    }
});
app.use(roles.middleware());

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





//routes/index.js for passport login 
var routes = require('./routes/index')(passport);
app.use('/', routes);
//routes/horse_crud.js for horse CRUD
var horses = require('./routes/horse_crud');
app.use('/horses', horses);
//routes/competitions_crud.js for Competitions CRUD
var competitions = require('./routes/competition_crud');
app.use('/competitions', competitions);

// server
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));



//redirecters
app.get('/', function(req, res){
   res.render('home'); 
});

app.get('/watcher_p', function(req, res){
   res.render('panel_w/watcher_p'); 
});

app.get('/admin_p', roles.can('admin_p'), function(req, res){
//app.get('/admin_p', function(req, res){
   res.render('panel_a/admin_p'); 
});

app.get('/judge_p', roles.can('judge_p'), function(req, res){
//app.get('/judge_p', function(req, res){
   res.render('panel_j/judge_p'); 
});


//błędy 404/500
app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.render('404');
});

app.use(function(req, res){
    res.type('text/html');
    res.status(500);
    res.render('500');
});


//nasłuchiwanie serwera
app.listen(app.get('port'), function(){
    console.log('Server nasłuchuje na porcie:' + app.get('port'));
});