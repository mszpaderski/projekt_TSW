//var socketIo = require('socket.io');
//var socketIoClient = require('socket.io-client');


window.addEventListener("load", function (event) {
var socket = io.connect();

//ADMIN SIDE
    
    //not working at the moment
    $('.group_start').on('click', function(event){
        console.log(this.value); 
        $(this).prop('disabled', true);
        var ulm = $(this).next();
        $('ulm > li > button').prop('disabled', false);
    });
    
    $('.grade_start').on('click', function(event){
        console.log(this.value + 'koń');
        socket.emit('grade_start', this.value);
        $(this).prop('disabled', true).next().prop('disabled', false);
        return false;
    });
    
    
    
    
    
    
});