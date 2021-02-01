/**
 * Module dependencies.
 */
var express = require("express"),
  path = require("path"),
  streams = require("./app/streams.js")();

var favicon = require("serve-favicon"),
  logger = require("morgan"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser"),
  errorHandler = require("errorhandler");
var https = require("https");
const fs = require('fs');
const http = require('http');

var credentials = {
  key: fs.readFileSync("certificates/key.pem", "utf8"),
  cert: fs.readFileSync("certificates/cert.pem", "utf8"),
};
var app = express();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);


// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, "public")));

// development only
if ("development" == app.get("env")) {
  app.use(errorHandler());
}

// routing
require("./app/routes.js")(app, streams);

// var server = app.listen(app.get("port"), function () {
//   console.log("Express server listening on port " + app.get("port"));
// });

// httpServer.listen(3000);
const server = httpsServer.listen(8443);

var io = require("socket.io").listen(httpsServer);
/**
 * Socket.io event handling
 */
require("./app/socketHandler.js")(io, streams);
