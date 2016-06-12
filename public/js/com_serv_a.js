/* jshint node: true, browser: true  */
/*global $:false, io:false */
"use strict";


window.addEventListener("load", function (event) {
var socket = io.connect();
    var horse_id, i;
    var grade_ping;
    var judge_list;

//ADMIN SIDE
    
    //not working at the moment
    $('.group_start').on('click', function(event){
        console.log(this.val()); 
        $(this).prop('disabled', true);
        var ulm = $(this).next();
        $('ulm > li > button').prop('disabled', false);
    });
    
    //start grading
    $('.grade_start').on('click', function(event){
        horse_id = this.value;
        console.log(horse_id + 'koń');
        socket.emit('grade_start', horse_id);
        $(this).prop('disabled', true).next().prop('disabled', false);
        judge_list = document.getElementsByClassName('judge_list');
        grade_ping = '';
        console.log(judge_list);
        for(i=0;i<judge_list.length;i++){
            grade_ping += "<img src='/img/bullet_red.png', width='18px', class='grade_ping_red', id='grade_ping"+judge_list[i].id+"'>";
        
        }
        $('#grading'+horse_id).html(grade_ping);  
        
    });

    //Stop grading
    $('.grade_stop').on('click', function(event){
        horse_id = this.value;
        console.log(horse_id + 'koń koniec');
        var judge_grade = document.getElementsByClassName('grade_ping_red');
        console.log(judge_grade);
        if(judge_grade.length !== 0){
            var judge_reminder = [];
            for(i=0;i<judge_grade.length;i++){
                judge_reminder.push(judge_grade[i].id.substring(10));
                console.log(judge_reminder[i]);
            }
            $('#error_field').html('Nie wszyscy wystawili oceny! Wysłano ponaglenie!');
            socket.emit('reminder', judge_reminder);
        }else{
            socket.emit('grade_stop', horse_id);
            $(this).prop('disabled', true);
            $('#grading'+horse_id).html(' Oceniony!');
            $('#error_field').html('');
        }
    });
    
    
    socket.on('judge_connect', function (judge_id) {
        console.log('Judge came: '+judge_id);
            $('#' + judge_id).prop('src', "/img/bullet_green.png");
    });
    socket.on('judge_disconnect', function (judge_id) {
        console.log('Judge is gone: '+judge_id);
            $('#' + judge_id).prop('src', "/img/bullet_red.png");
    });
    
    socket.on('grade_end', function(judge_id){
       console.log('Judge finished judging: '+judge_id);
        $('#grade_ping'+judge_id).prop('src', '/img/bullet_green.png');
        $('#grade_ping'+judge_id).prop('class', 'grade_ping_green');
    });
    
});