var express = require('express');

var app = express();

app.disable('x-powered-by');

var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');






// server
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
   res.render('home'); 
});

app.get('/watcher_p', function(req, res){
   res.render('watcher_p'); 
});

app.get('/admin_p', function(req, res){
   res.render('admin_p'); 
});

app.get('/judge_p', function(req, res){
   res.render('judge_p'); 
});


//błędy 404/500
app.use(function(req, res){
    res.type('text/html')
    res.status(404);
    res.render('404');
});

app.use(function(req, res){
    res.type('text/html')
    res.status(500);
    res.render('500');
});


//nasłuchiwanie serwera
app.listen(app.get('port'), function(){
    console.log('Server nasłuchuje na porcie:' + app.get('port'))
});