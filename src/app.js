var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var RateLimit = require('express-rate-limit');
var helmet = require('helmet');

var db = require('./db');
var postController = require('./controllers/post-controller');
var authController = require('./controllers/auth-controller');

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

/* Use helmet to set various HTTP headers for security */
app.use(helmet());

/* Set up global rate limiting */
app.enable('trust proxy');
// var apiLimiter = new RateLimit({
//     windowMs: 15*60*1000, // 15 min
//     max: 100
// });
// app.use('/api', apiLimiter);

module.exports = app;