//var socketIo = require('socket.io');
//var socketIoClient = require('socket.io-client');


window.addEventListener("load", function (event) {
var socket = io.connect();

//JUDGE SIDE
var grade = [0,0,0,0,0];
    
$('#type').on("blur", function(event){
    console.log(type.value);
    grade[0] = type.value;
    socket.emit('grade_change', grade);
});
$('#head').on("blur", function(event){
    console.log(head.value);
    grade[1] = head.value;
    socket.emit('grade_change', grade);
});
$('#body').on("blur", function(event){
    console.log(body.value);
    grade[2] = body.value;
    socket.emit('grade_change', grade);
});
$('#legs').on("blur", function(event){
    console.log(legs.value);
    grade[3] = legs.value;
    socket.emit('grade_change', grade);
});
$('#move').on("blur", function(event){
    console.log(move.value);
    grade[4] = move.value;
    socket.emit('grade_change', grade);
});

$('#grade_add').on('click', function(event){
   event.preventDefault();
    $('input').prop('disabled', true);
    socket.emit('grade_add', grade);
});


    
    
    
    
    
    
    
    
});