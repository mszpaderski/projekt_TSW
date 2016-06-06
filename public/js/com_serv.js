//var socketIo = require('socket.io');
//var socketIoClient = require('socket.io-client');


window.addEventListener("load", function (event) {
var socket = io.connect();


var type = document.getElementById('type');
var head = document.getElementById('head');
var body = document.getElementById('body');
var legs = document.getElementById('legs');
var move = document.getElementById('move');
var grade = [0,0,0,0,0];
    
type.addEventListener("blur", function(event){
    console.log(type.value);
    grade[0] = type.value;
    socket.emit('Zmiana', grade);
});
head.addEventListener("blur", function(event){
    console.log(head.value);
    grade[1] = head.value;
    socket.emit('Zmiana', grade);
});
body.addEventListener("blur", function(event){
    console.log(body.value);
    grade[2] = body.value;
    socket.emit('Zmiana', grade);
});
legs.addEventListener("blur", function(event){
    console.log(legs.value);
    grade[3] = legs.value;
    socket.emit('Zmiana', grade);
});
move.addEventListener("blur", function(event){
    console.log(move.value);
    grade[4] = move.value;
    socket.emit('Zmiana', grade);
});


//socket.on('message', function(data){
//    console.log(data.message.user + ' ' + data.message.text);
//});
    
});