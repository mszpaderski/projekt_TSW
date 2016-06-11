/* jshint node: true */
"use strict";

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
    
    socket.on('grade_change', function(data){
        console.log(data + ' ' + userId);
                //Updating/creating GRADE in Mongo
       // find a grade in Mongo
       Grade.findOne({ 'judge_id' : userId, 'player_id' : data.playerId  }, function(err, grade_m) {
           // In case of any error, return using the done method
           if (err){
               console.log('Error in SignUp: '+err);
            }
            // already exists -> update
            if (grade_m) {
                grade_m.update({
                kat_1 : data.grades0,
                kat_2 : data.grades1,
                kat_3 : data.grades2,
                kat_4 : data.grades3,
                kat_5 : data.grades4
                }, function(err, grade_m){if(err){console.log(err);}else{console.log('Grade updated');}});
            } else {
                // if there is no grade match
                // create grade
                mongoose.model('Grade').create({
                player_id : data.playerId,
                judge_id : userId,
                kat_1 : data.grades0,
                kat_2 : data.grades1,
                kat_3 : data.grades2,
                kat_4 : data.grades3,
                kat_5 : data.grades4
                }, function(err, grade_m){if(err){console.log(err);}else{console.log('Grade saved');}});
            }
        });
        if(data.end){
            socket.broadcast.emit('grade_end', userId);
        }
    });

    //Admin started grading
    socket.on('grade_start', function(player_id){
        Player.findOne({'horse_id' : player_id}, function(err, player){
            if(err){ console.log('Error ' +err);}
            if(player){
                player.update({
                    current : true 
                }, function(err, player_u){
                    if(err){console.log(err);} else {
                        console.log(player_u + ' ' + player);
                        socket.broadcast.emit('current_horse_ans', { is: 'next', horse: player}); 
                    }
                });
            }
        });    
    });
    //Admin tried to stop grading, but some judges did not send grade. Sending reminders to judges
    socket.on('reminder', function(judge_list){
        console.log('WAT' + judge_list);
       //for(var i=0;i<judge_list.length;i++){
           //console.log('Ponaglam: ' + judge_list[i]);
           socket.broadcast.emit('reminder');
       //} 
    });
    
    //Admin stopped grading
    socket.on('grade_stop', function(player_id){
        Player.findOne({'horse_id' : player_id}, function(err, player){
            if(err){ console.log('Error ' +err);}
            if(player){
                var final_grade = 0, final_type = 0, final_move = 0;
                mongoose.model('Grade').where('player_id', player._id).exec(function(err, grades){
                    if(err){console.log(err);}else{
                        console.log(grades);
                        for(var i=0;i<grades.length;i++){
                            final_grade += parseInt(grades[i].kat_1) + parseInt(grades[i].kat_2) + parseInt(grades[i].kat_3) + parseInt(grades[i].kat_4) + parseInt(grades[i].kat_5);
                            final_type += parseInt(grades[i].kat_1);
                            final_move += parseInt(grades[i].kat_5);
                        }
                        console.log(final_grade);
                        console.log(grades.length);
                        final_grade = final_grade/grades.length;
                        final_type = final_type/grades.length;
                        final_move = final_move/grades.length;
                        console.log(final_grade);
                        
                        player.update({
                            final_grade: final_grade,
                            final_type: final_type,
                            final_move: final_move,
                            current : false 
                        }, function(err, player_u){
                            if(err){console.log(err);} else {
                                console.log(player_u + ' ' + player);
                                socket.broadcast.emit('current_horse_end', {horse: player}); 
                            }
                        });
                    }
                });
                

            }
        });    
    });
    
    //checking is there a current horse
    socket.on('current_horse', function(player){
        Player.findOne({'current' : true}, function(err, horse){
            if(err){ console.log('Error ' +err);}
            if(horse){
                console.log(horse);
                Grade.findOne({'player_id' : horse._id, 'judge_id' : userId}, function(err, grade){
                    if(err){ console.log('Error ' +err);}
                    if(grade){
                        console.log('Sending: horse ' + horse._id + ' grade ' + grade);
                        socket.emit('current_horse_ans', { is: 'true' , horse: horse, grade: grade}); 
                    } else{
                        console.log('qoue?');
                        socket.emit('current_horse_ans', { is: 'next', horse: horse}); 
                    }
                });
            } else {
                socket.emit('current_horse_ans', {is: 'false'}); 
            }
        });      
    });
    
    socket.on('judge_connected', function(){
        socket.broadcast.emit('judge_connect', userId);
        console.log('Judge connected: '+userId);
    });
    socket.on('disconnect', function(){
        socket.broadcast.emit('judge_disconnect', userId);
        console.log('Judge disconnected: '+userId);
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
//routes/index.js for passport login 
var watchers = require('./routes/watcher_competition');
app.use('/watcher_p', watchers);

// server
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));



//redirecters
app.get('/', function(req, res){
   res.render('home'); 
});

app.get('/watcher_p', function(req, res){
    mongoose.model('Competition').find({}, function (err, competitions) {
        if (err){
            return console.error(err);
        } else {
            res.format({
                html: function(){
                    res.render('panel_w/watcher_p', {
                        "competitions" : competitions
                    });
                },
                json: function(){
                     res.json(competitions);
                }
            });
        }
    });
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

