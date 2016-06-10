/* jshint node: true, browser: true  */
/*global $:false, io:false */
"use strict";


window.addEventListener("load", function (event) {
var socket = io.connect();

//ADMIN SIDE
    
    //not working at the moment
    $('.group_start').on('click', function(event){
        console.log(this.val()); 
        $(this).prop('disabled', true);
        var ulm = $(this).next();
        $('ulm > li > button').prop('disabled', false);
    });
    
    $('.grade_start').on('click', function(event){
        console.log(this.val() + 'koń');
        socket.emit('grade_start', this.val());
        $(this).prop('disabled', true).next().prop('disabled', false);
    });
    $('.grade_stop').on('click', function(event){
        console.log(this.val() + 'koń koniec');
        socket.emit('grade_stop', this.val());
        $(this).prop('disabled', true); //.next().prop('disabled', false);
    });
    
    socket.on('judge_connect', function (judge_id) {
        console.log('Judge came: '+judge_id);
            $('#' + judge_id).prop('src', "/img/bullet_green.png");
    });
    socket.on('judge_disconnect', function (judge_id) {
        console.log('Judge is gone: '+judge_id);
            $('#' + judge_id).prop('src', "/img/bullet_red.png");
    });
    
    
});