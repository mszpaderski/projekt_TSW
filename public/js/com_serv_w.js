/* jshint node: true, browser: true */
/*global $:false, io:false */
"use strict";


window.addEventListener("load", function (event) {
var socket = io.connect();
    var grade_table, i, player_name;

//WATCHER SIDE
    socket.on('grade_collect', function(data){
       console.log('Grade was made: '+ data.horse);
        player_name = '#' + data.horse.starting_num + ': ' + data.horse.horse_id;
        console.log(player_name);
        $('#horse_name').html(player_name);
        grade_table = '<table><tr><td>Sędzia:</td><td>';
        for(i=1;i<= data.grades.length;i++){
            grade_table += '<td>#'+i+'</td>';
        }
        console.log(data.grades);
        grade_table += '</tr><tr><td>Typ:</td>';
        for(i=1;i<= data.grades.length;i++){
            grade_table += '<td>'+data.grades[i-1].kat_1+'</td>';
        }
        grade_table += '</tr><tr><td>Głowa i Szyja:</td>';
        for(i=1;i<= data.grades.length;i++){
            grade_table += '<td>'+data.grades[i-1].kat_2+'</td>';
        }
        grade_table += '</tr><tr><td>Kłoda:</td>';
        for(i=1;i<= data.grades.length;i++){
            grade_table += '<td>'+data.grades[i-1].kat_3+'</td>';
        }
        grade_table += '</tr><tr><td>Nogi:</td>';
        for(i=1;i<= data.grades.length;i++){
            grade_table += '<td>'+data.grades[i-1].kat_4+'</td>';
        }
        grade_table += '</tr><tr><td>Ruch:</td>';
        for(i=1;i<= data.grades.length;i++){
            grade_table += '<td>'+data.grades[i-1].kat_5+'</td>';
        }
        grade_table += '</tr></table>';
        
        
        
        $('#current_grade').html(grade_table);
    });
    
    
    
    
});