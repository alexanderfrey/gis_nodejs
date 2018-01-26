// including libraries
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// define port
var port = 8080;

app.use(express.static('public'));


// serve files on request
function handler(request, response) {
	request.addListener('end', function() {
		files.serve(request, response);
	});
}

// listen for incoming connections from client
io.on('connection', function (socket) {
	console.log('a user connected');
  // start listening for coords
  socket.on('send:boxes', function (data) {
		console.log('received data id ' + data.id)
  	// broadcast your coordinates to everyone except you
  	socket.broadcast.emit('load:boxes', data);
  });

	socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(port, function () {
  console.log('Example app listening on port ' + port);
});
