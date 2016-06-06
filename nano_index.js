var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
//var server = app.listen(3000);

var socketIo = require('socket.io');
var socketIoClient = require('socket.io-client');
var passportSocketIo = require('passport.socketio');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');


var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');




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
var midleSession = expressSession({
    secret: 'KeyToKingdome',
    resave: false,
    saveUninitialized: true,
    store: new (require("connect-mongo")(expressSession))({
        url: dbConfig.url
    })
});
app.use(midleSession);
app.use(passport.initialize());
app.use(passport.session());
//Passport initialize
var initPassport_User = require('./passport/init_user');
initPassport_User(passport);


//SOCKET Conf
var io = socketIo();
app.io = io;
io.attach(server);
io.use(function(socket, next){
    midleSession(socket.request, {}, next);
});


var Grade = require('./models/competitions/grade'),
    Player = require('./models/competitions/player'),
    Judge_c = require('./models/competitions/judge_c'),
    mongoose = require('mongoose'); //mongo connection

//Socket functions
io.sockets.on('connection', function(socket){
    var userId = socket.request.session.passport.user;
    var playerId = '57558e341b89299c08d51ab0';
    var CreateOrUpdateGrade = function(grades){
       // find a Admin in Mongo with provided admin_id
       Grade.findOne({ 'judge_id' : userId, 'player_id' : playerId  }, function(err, grade_m) {
           // In case of any error, return using the done method
           if (err){
               console.log('Error in SignUp: '+err);
            }
            // already exists -> update
            if (grade_m) {
                grade_m.update({
                kat_1 : grades[0],
                kat_2 : grades[1],
                kat_3 : grades[2],
                kat_4 : grades[3],
                kat_5 : grades[4]
                }, function(err, grade_m){if(err){console.log(err);}else{console.log('Grade updated');}});
            } else {
                // if there is no grade match
                // create grade
                mongoose.model('Grade').create({
                player_id : playerId,
                judge_id : userId,
                kat_1 : grades[0],
                kat_2 : grades[1],
                kat_3 : grades[2],
                kat_4 : grades[3],
                kat_5 : grades[4]
                }, function(err, grade_m){if(err){console.log(err);}else{console.log('Grade saved');}});
            }
        });
    };
    socket.on('Zmiana', function(grades){
        console.log(grades + ' ' + userId);
        CreateOrUpdateGrade(grades);
    });
    
    socket.on('grade_add', function(grades){
        console.log(grades);
        

        CreateOrUpdateGrade(grades);
    });
    
    
    
    
    
    
    
    console.log('a user connected' + userId);
    socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


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
var routes = require('./routes/admin_judge_crud')(passport);
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
server.listen(app.get('port'), function(){
    console.log('Server nasłuchuje na porcie:' + app.get('port'));
});

