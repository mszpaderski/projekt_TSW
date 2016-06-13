/* jshint node: true */
"use strict";


var socketIo = require('socket.io');

module.exports.listen = function(app){
var io = socketIo.listen(app);

var judges = io.of('/judges');

io.sockets.on('connection', function(socket){
    var userId = socket.request.session.passport.user;
    socket.on('Zmiana', function(text){
        console.log(text + ' ' + userId);
    });
    console.log('a user connected' + userId);
    socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
    
};
