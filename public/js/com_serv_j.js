/* jshint node: true, browser: true  */
/*global $:false, io:false */
"use strict";

window.addEventListener("load", function (event) {
var socket = io.connect();

//JUDGE SIDE
var grade = [0,0,0,0,0];
var playerId;
    
$('#type').on("blur", function(event){
    playerId = $('#player').text();
    grade[0] = $('#type').value;
    socket.emit('grade_change',{ playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#head').on("blur", function(event){
    playerId = $('#player').text();
    grade[1] = $('#head').value;
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#body').on("blur", function(event){
    playerId = $('#player').text();
    grade[2] = $('#body').value;
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#legs').on("blur", function(event){
    playerId = $('#player').text();
    grade[3] = $('#legs').value;
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#move').on("blur", function(event){
    playerId = $('#player').text();
    grade[4] = $('#move').value;
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});

$('#grade_add').on('click', function(event){
    playerId = $('#player').text();
   event.preventDefault();
    grade[4] = $('#move').value;
    grade[3] = $('#legs').value;
    grade[2] = $('#body').value;
    grade[1] = $('#head').value;
    grade[0] = $('#type').value;
    $('input').prop('disabled', true);
    socket.emit('grade_add', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});


    
socket.on('grade_start', function(player){
    console.log(player + ' KOŃ OFJOFIEHFOI');
   $('#player').html(player); 
});
    
    
    
    
    
    
    
    
});