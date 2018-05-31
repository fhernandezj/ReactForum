var express = require("express");   
var path = require("path");   
 
  var app = express();
  app.use(express.static(__dirname + "/public")); 
  app.use(express.static(__dirname + "/images")); 

  app.get('*', function (request, response){
    response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
  })

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8081, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
    
  });