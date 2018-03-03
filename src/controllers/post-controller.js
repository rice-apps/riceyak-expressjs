var express = require('express');
var bodyParser = require('body-parser');
var RateLimit = require('express-rate-limit');
var _ = require('underscore');
var router = express.Router();

var Post = require('../models/post');
var User = require('../models/user');
var Comment = require('../models/comment');
var authMiddleWare = require('../middleware/auth-middleware'); // auth checker
router.use(authMiddleWare);
router.use(bodyParser.json());

// TODO - comment the dev limit values out
// TODO - add maxlength to object schemas (post title: 100, post body: 10000, comment: 1000) and return error

/* Set up rate limiting */
var postLimiter = new RateLimit({
    windowMs: 15*60*1000, // 15 min window
    max: 500, // maximum 7 posts per window
    delayAfter: 0, // start delaying requests after 3 posts in window
    // delayMs: 1000 // delay by 1 second per post after delayAfter limit reached
});

var commentLimiter = new RateLimit({
    windowMs: 5*60*1000, // 5 minute window
    max: 500, // max 10 comments per window
    delayAfter: 0, // 5
    // delayMs: 1000
});

var getLimiter = new RateLimit({
    windowMs: 3*60*1000, // 3 minute window
    max: 3*60, // maximum 180 (1/sec)
    delayAfter: 0
});


/**
 * Returns all posts.
 */
router.get('/', getLimiter,  function (request, response) {
   //'find' returns all objects matching the given query - and all objects match the empty query "{}".

   // Most db operations take a function as their second argument, which is called after the query completes. This
   // function executes after the operation finishes - if there's an error, the first argument (err) is true. If not,
   // the second argument (posts) contains our results.
   Post.find({}).sort('-date').limit(100).exec(function (err, posts) {
       if (err) {
           return response.status(500).send(); // db error (500 internal server error)
       }
       return response.status(200).send(posts); // success - send the posts!
   })
});

router.put('/:post_id/voteComment', function (req, res) {
    // check if vote value is valid
    if (req.body.vote > 1 || req.body.vote < -1) {
        return res.status(400).send("Vote value out of bounds");
    }

    // find user
    User.findById(req.user.userID, function (err, user) {
        if (err) return res.status(500).send();
        if (!user) return res.status(404).send();

        // find post
        Post.findById(req.params.post_id, function (err, post) {
            if (err) return res.status(500).send();
            if (!post) return res.status(404).send();



            Comment.findById(req.body.comment_id, function (err, comment) {
                if (err) return res.status(500).send();
                if (!comment) return res.status(404).send();

                // find index of vote in vote array where vote user equals the requester; else -1
                var idx = _.findIndex(comment.votes, function (v) {
                    if (v.user.equals(user._id)) {
                        return true;
                    }
                });

                // if no current vote for this user in vote array, create new; else update the vote
                if (idx == -1) {
                    comment.votes.push({ user: user, vote: req.body.vote });
                } else {
                    comment.votes[idx].vote = req.body.vote
                }

                comment.save(function (err, newComment) {
                    if (err) return res.status(500).send();
                    Post.findById(req.params.post_id, function (err, updatedPost) {
                        if (err) return res.status(500).send();
                        return res.status(200).send(updatedPost);
                    });
                });
            });
        });
    });
});
/**
 * Vote on a post.
 */
router.put('/:post_id/vote', getLimiter, function (req, res) {
    // check if vote value is valid
    if (req.body.vote > 1 || req.body.vote < -1) {
        return res.status(400).send("Vote value out of bounds");
    }

    // find user
    User.findById(req.user.userID, function (err, user) {
        if (err) return res.status(500).send();
        if (!user) return res.status(404).send();

        // find post
        Post.findById(req.params.post_id, function (err, post) {
            if (err) return res.status(500).send();
            if (!post) return res.status(404).send();

            // find index of vote in vote array where vote user equals the requester; else -1
            var idx = _.findIndex(post.votes, function (v) {
                if (v.user.equals(user._id)) {
                    return true;
                }
            });

            // if no current vote for this user in vote array, create new; else update the vote
            if (idx == -1) {
                post.votes.push({ user: user, vote: req.body.vote });
            } else {
                post.votes[idx].vote = req.body.vote
            }


            // save the post and send
            post.save(function (err, newPost) {
                if (err) res.status(500).send();
                return res.status(200).send(newPost);
            })
        })
    });
});


/**
 * Posts a post.
 */
router.post('/', postLimiter, function (req, res) {
    User.findById(req.user.userID, function (err, user) {
        if (err) return res.status(500).send();
        if (!user) return res.status(404).send();

        Post.create({
            title: req.body.title,
            body: req.body.body,
            author: user,
            date: Date.now(),
            comments: []
        }, function (err, post) {
            if (err) return res.status(500).send();
            return res.status(200).send(post);
        });
    })

});


/**
 * Gets a single post.
 */
router.get('/:id', getLimiter, function (request, response) {
    Post.findById(request.params.id, function (err, post) {
        if (err) {
            return response.status(500).send();
        }
        if (!post) {
            return response.status(404).send();
        }

        return response.status(200).send(post);
    })
});


/**
 * Posts a comment.
 */
router.post('/:id/comments', commentLimiter, function (req, res) {
    // find user
       console.log(req.user.userID);
       User.findById(req.user.userID, function (err, user) {

            if (err) return res.status(500).send();
            if (!user) return res.status(404).send();

        // if found, then create comment
        Comment.create(
            {
                body: req.body.comment,
                author: user,
                date: Date.now(),
                score: 0
            },
            function (err, comment) {
                if (err) res.status(500).send();

                // find post
                Post.findById(req.params.id, function (err, post) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send();
                    }
                    if (!post) {
                        return res.status(404).send();
                    }

                    // add comment and save
                    post.comments.push(comment);
                    post.save(function (err, post) {
                        return res.status(200).send(post);
                    })
                });
            }
        );
    });
});


/**
 * Updates a post given a new post state
 */
router.put('/:id', commentLimiter, function (req, res) {

    // find user
    User.findById(req.user.userID, function (err, user) {
        if (err) return res.status(500).send();
        if (!user) return res.status(404).send();

        // find post
        Post.findById(req.params.id, function (err, post) {
            if (err) {
                return response.status(500).send(); // db error (500 internal server error)
            }
            if (!post) {
                return response.status(404).send(); // not found (404 not found)
            }

            //if post author matches user, then perform update

            if (post.author.equals(user)) {

                // for every property in req.body, check that the post schema also has that property (so people can't
                // add new properties to our objects)

                if (!(Object.keys(req.body).every( function(prop) { return Post.schema.paths.hasOwnProperty(prop); } ))) {
                    return res.status(400).send("Given object does not match db format");
                }

                // extend the post (copies values from req.body onto post) and save it
                post = _.extend(post, req.body);
                post.save(function (err, post) {
                    return res.status(200).send(post);
                });

            } else {
                return res.status(401).send();
            }
        });
    });
});


/**
 * Deletes a post.
 */
router.delete('/:id', function (req, res) {
    User.findById(req.user.userID, function (err, user) {

        if (err) return res.status(500).send();
        if (!user) return res.status(404).send();

        Post.findById(req.params.id, function (err, post) {

            if (err) return res.status(500).send();

            if (!post) return res.status(404).send();

            if (post.author.equals(user)) {
                post.remove(function (err) {
                    if (err) return res.status(500).send();
                });
                return res.status(200).send();

            } else {
                return res.status(401).send()
            }
        })
    })
});

module.exports = router;
