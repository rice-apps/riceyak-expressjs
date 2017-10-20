var express = require('express');
var morgan = require('morgan');
var cors = require('cors');

var db = require('./db');
var config = require('./config');
var postController = require('./controllers/post-controller');
var authController = require('./controllers/auth-controller');

/* Get an Express app instance */
var app = express();

/* Set up request logging */
app.use(morgan('combined'));

/* Enable CORS */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.frontendURL);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* Declare our routes */
app.use('/posts', postController);
app.use('/auth', authController);

module.exports = app;