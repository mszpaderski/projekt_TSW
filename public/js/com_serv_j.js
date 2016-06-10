/* jshint node: true, browser: true  */
/*global $:false, io:false */
"use strict";

window.addEventListener("load", function (event) {
var socket = io.connect();

//JUDGE SIDE
var grade = [0,0,0,0,0];
var playerId, id;
var num = 0;
    
    //setting up
    $('input, button').prop('disabled', true);
    socket.emit('current_horse');
    socket.on('current_horse_ans', function(data){
        if(data.is === 'true'){
            $('#player').html('Koń #' + data.horse.starting_num); 
            $('#type').prop('value', data.grade.kat_1);
            $('#head').prop('value', data.grade.kat_2);
            $('#body').prop('value', data.grade.kat_3);
            $('#legs').prop('value', data.grade.kat_4);
            $('#move').prop('value', data.grade.kat_5); 
            $('#player_id').prop('value', data.horse._id); 
            $('input, button').prop('disabled', false);
            grade = [data.grade.kat_1, data.grade.kat_2, data.grade.kat_3, data.grade.kat_4, data.grade.kat_5];
        } else if(data.is === 'next'){
            $('#player').html('Koń #' + data.horse.starting_num);
            $('input').prop('value', num); 
            $('#player_id').prop('value', data.horse._id); 
            $('input, button').prop('disabled', false);
        } else {
            $('#player').html('Nie ma aktualnie konia do oceny, prosze poczekać.');
            $('input').prop('value', num);
        }
    });
    
//Saving scores on blur
$('#type').on("blur", function(event){
    playerId = $('#player_id').val();
    grade[0] = $('#type').val();
    socket.emit('grade_change',{ playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#head').on("blur", function(event){
    playerId = $('#player_id').val();
    grade[1] = $('#head').val();
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#body').on("blur", function(event){
    playerId = $('#player_id').val();
    grade[2] = $('#body').val();
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#legs').on("blur", function(event){
    playerId = $('#player_id').val();
    grade[3] = $('#legs').val();
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
$('#move').on("blur", function(event){
    playerId = $('#player_id').val();
    grade[4] = $('#move').val();
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});
//saves score and disables the changes
$('#grade_add').on('click', function(event){
    playerId = $('#player_id').val();
   event.preventDefault();
    grade[4] = $('#move').val();
    grade[3] = $('#legs').val();
    grade[2] = $('#body').val();
    grade[1] = $('#head').val();
    grade[0] = $('#type').val();
    $('input').prop('disabled', true);
    socket.emit('grade_change', { playerId: playerId, grades0: grade[0], grades1: grade[1], grades2: grade[2], grades3: grade[3], grades4: grade[4]});
});



    
    
    
    
    
    
    
    
});