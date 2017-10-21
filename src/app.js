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
app.use(cors());

/* Declare our routes */
app.use('/posts', postController);
app.use('/auth', authController);

module.exports = app;