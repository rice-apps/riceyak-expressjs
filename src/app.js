var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
var RateLimit = require('express-rate-limit');

var postController = require('./controllers/post-controller');
var authController = require('./controllers/auth-controller');

/* Get an Express app instance */
var app = express();

/* Set up global rate limiting */
app.enable('trust proxy');
var apiLimiter = new RateLimit({
    windowMs: 15*60*1000, // 15 min
    max: 100
});
app.use('/api/', apiLimiter);

/* Set up request logging */
app.use(morgan('combined'));

/* Enable CORS */
app.use(cors());

/* Enable parsing request bodies */
app.use(bodyParser.json());

/* Declare our routes */
app.use('/api/posts', postController);
app.use('/api/auth', authController);

module.exports = app;