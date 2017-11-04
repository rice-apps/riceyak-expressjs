var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();

/* Get our authorization checker */
var authMiddleWare = require('../middleware/auth-middleware');

var Post = require('../models/post');
var User = require('../models/user');

var _ = require('underscore');

/* Plug our authorization checker in */
router.use(authMiddleWare);

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
    User.findOne({username: req.user.user}, function (err, user) {
        if (err) return res.status(500);
        if (!user) return res.status(404);
        Post.create({
            title: req.body.title,
            body: req.body.body,
            author: user,
            date: Date.now()
        }, function (err, post) {
            if (err) return res.status(500);
            res.status(200).send(post);
        });
    })
    
});

router.get('/:id', function (request, response) {
    //'findById' returns the object matching the id pulled from the request parameters

    // Most db operations take a function as their second argument, which is called after the query completes. This
    // function executes after the operation finishes - if there's an error, the first argument (err) is true. If not,
    // the second argument (post) contains our results.

    Post.findById(request.params.id, function (err, post) {
        if (err) {
            return response.status(500); // db error (500 internal server error)
        }
        if (!post) {
            return response.status(404); // not found (404 not found)
        }

        response.status(200).send(post); // success - send the post!
    })
});

router.put('/:id', function (req, res) {
    //find user
    //if found, then find the post by id
    //if post author matches user, then perform update and send updated post back
    User.findOne({username: req.user.user}, function (err, user) {
        if (err) return res.status(500);
        if (!user) return res.status(404);
        Post.findById(req.params.id, function (err, post) {
            if (err) {
                return response.status(500); // db error (500 internal server error)
            }
            if (!post) {
                return response.status(404); // not found (404 not found)
            }

            if(post.author.equals(user)){
                return res.status(401);
            }

            post = _.extend(post,req.body);
            post.save(function (err, post) {
                res.status(200).send(post);
            })

             // success - send the post!
        })
    })
    /*Post.findOneAndUpdate({_id: req.params.id, author: req.user.user}, req.body,{new: true}, function (err, post) {
        if (err){
            return res.status(500);
        }
        if (!post){
            return res.status(404);
        }
        res.status(200).send(post);

    });*/

});
module.exports = router;

