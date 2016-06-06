//var socketIo = require('socket.io');
//var socketIoClient = require('socket.io-client');


window.addEventListener("load", function (event) {
var socket = io.connect();


var grade = [0,0,0,0,0];
    
//type.addEventListener("blur", function(event){
$('#type').on("blur", function(event){
    console.log(type.value);
    grade[0] = type.value;
    socket.emit('Zmiana', grade);
});
$('#head').on("blur", function(event){
    console.log(head.value);
    grade[1] = head.value;
    socket.emit('Zmiana', grade);
});
$('#body').on("blur", function(event){
    console.log(body.value);
    grade[2] = body.value;
    socket.emit('Zmiana', grade);
});
$('#legs').on("blur", function(event){
    console.log(legs.value);
    grade[3] = legs.value;
    socket.emit('Zmiana', grade);
});
$('#move').on("blur", function(event){
    console.log(move.value);
    grade[4] = move.value;
    socket.emit('Zmiana', grade);
});

$('#grade_add').on('click', function(event){
   event.preventDefault();
    socket.emit('grade_add', grade);
});
    
});