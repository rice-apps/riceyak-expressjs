var express = require('express');
var morgan = require('morgan');

var db = require('./db');
var postController = require('./controllers/post-controller');
var authController = require('./controllers/auth-controller');

/* Get an Express app instance */
var app = express();

/* Set up request logging */
app.use(morgan('combined'));

/* Declare our routes */
app.use('/posts', postController);
app.use('/auth', authController);

module.exports = app;