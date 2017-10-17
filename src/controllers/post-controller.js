var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var Post = require('../models/post');

router.use(bodyParser.json());

/**
 * Returns all posts.
 */
router.get('/', function (request, response) {
   //'find' returns all objects matching the given query - and all objects match the empty query "{}".

   // Most db operations take a function as their second argument, which is called after the query completes. This
   // function executes after the operation finishes - if there's an error, the first argument (err) is true. If not,
   // the second argument (posts) contains our results.
   Post.find({}, function (err, posts) {
       if (err) {
           return response.status(500); // db error (500 internal server error)
       }
       if (!posts) {
           return response.status(404); // not found (404 not found)
       }
       response.status(200).send(posts); // success - send the posts!
   })
});

/**
 * Posts a post.
 */
router.post('/', function (req, res) {
    // req.body lets us access the body of the request, which contains the data for the post.
    Post.create({
        title: req.body.title,
        body: req.body.body,
        author: req.body.author,
        date: Date.now()
    }, function (err, post) {
        if (err) return res.status(500);
        res.status(200).send(post);
    });
});

module.exports = router;

