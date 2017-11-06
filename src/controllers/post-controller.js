var express = require('express');
var bodyParser = require('body-parser');
var RateLimit = require('express-rate-limit');

var router = express.Router();

var Post = require('../models/post');
var User = require('../models/user');

var _ = require('underscore');

/* Get our authorization checker and plug it in */
var authMiddleWare = require('../middleware/auth-middleware');
router.use(authMiddleWare);

/* Set up rate limiting */
var postLimiter = new RateLimit({
    windowMs: 15*60*1000, // 15 min window
    max: 7, // maximum 5 posts per window
    delayAfter: 3, // start delaying requests after 3 posts in window
    delayMs: 3*1000 // delay by 3 seconds per post after delayAfter limit reached
});

router.use(bodyParser.json());

/**
 * Returns all posts.
 */
router.get('/', function (request, response) {
   //'find' returns all objects matching the given query - and all objects match the empty query "{}".

   // Most db operations take a function as their second argument, which is called after the query completes. This
   // function executes after the operation finishes - if there's an error, the first argument (err) is true. If not,
   // the second argument (posts) contains our results.
   Post.find({}).sort('-date').limit(100).exec(function (err, posts) {
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
// TODO TURN ME OFF
// router.post('/', postLimiter, function (req, res) {
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
router.put('/:id/comments', function (req, res) {
    //find user
    //if found, then find the post by id
    //if post author matches user, then perform update and send updated post back
    console.log('here')
    User.findOne({username: req.user.user}, function (err, user) {
        if (err) return res.status(500);
        if (!user) return res.status(404);
        console.log('user')
        Post.findByIdAndUpdate(req.params.id,{$set:{comments: req.body.comments}},{new: true}, function (err, post) {
            console.log('comments')
            console.log(req.body.comments)
            if (err) {
                console.log(err);
                res.status(500).send('internal server error'); // db error (500 internal server error)
            }
            if (!post) {
                res.status(404).send('post not found'); // not found (404 not found)
            }
            console.log(post)
            res.status(200).send(post)
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

                post = _.extend(post,req.body);

                post.save(function (err, post) {
                    res.status(200).send(post);
                })
            }
            else{
                res.status(401).send('users not equal');
            }


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
router.delete('/:id', function (req, res) {
    User.findOne({username: req.user.user}, function (err, user) {
        if (err) return res.status(500);
        if (!user) return res.status(404);

        Post.findById(req.params.id, function (err, post) {
            if (err) return res.status(500);

            if (!post) return res.status(404).send("No post found.");
            if(post.author.equals(user)){
                post.remove(function (err) {
                    if (err) return res.status(500);
                });
                res.status(200).send("OK");
            }
            else {
                res.status(401).send("users dont match")
            }
        })
    })

})
module.exports = router;
