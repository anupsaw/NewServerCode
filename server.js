/* global __dirname */
var express = require('express');
var path = require('path');


global.requireFile = function(name){
	return require(path.join(__dirname, name));
}

var main =  requireFile('./app/app.js');

var server = express();
server.use(main.app);

server.listen(main.config.port, function (req, res) {
    console.log(new Date());
    console.log("Server is listening on port " + main.config.port)
})