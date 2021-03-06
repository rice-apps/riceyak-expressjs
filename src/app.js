var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var helmet = require('helmet');

var db = require('./db');
var postController = require('./controllers/post-controller');
var authController = require('./controllers/auth-controller');
var reportController = require('./controllers/report-controller');
var userController = require('./controllers/user-controller')

/* Get an Express app instance */
var app = express();

/* Enable CORS */
app.use(cors());

/* Set up request logging */
app.use(morgan('combined'));

/* Enable parsing request bodies */
app.use(bodyParser.json());

/* Declare our routes */
app.use('/api/posts', postController);
app.use('/api/auth', authController);
app.use('/api/reports', reportController);
app.use('/api/users', userController)

/* Use helmet to set various HTTP headers for security */
app.use(helmet());

/* Set up global rate limiting */
app.enable('trust proxy');
//app.disable('etag');

module.exports = app;