var express = require('express');
var bodyParser = require('body-parser');
var RateLimit = require('express-rate-limit');
var _ = require('underscore');
var router = express.Router();
var mongoose = require('mongoose');

var Post = require('../models/post');
var User = require('../models/user');
var Comment = require('../models/comment');
var authMiddleWare = require('../middleware/auth-middleware'); // auth checker
router.use(authMiddleWare);
router.use(bodyParser.json());

Map.prototype.setSafe = function (key, item) {
  if (typeof key == {type: mongoose.Schema.Types.ObjectId, ref: 'User'}) {
    this.set(key, item);
  } else {
    throw 'Invalid!';
  }
};

/**
 * Generates the "key" for the ratelimiter. The default uses IP addresses, but we can't because Rice only has a handful
 * of outward-facing IPs. We use the user ID from the token.
 */
var keyGen = function (req) {
  return req.user.userID;
};

/*
var postLimiter = new RateLimit({
  windowMs: 30 * 60 * 1000, // 30 min window
  max: 10, // maximum 10 posts per window
  delayAfter: 0, // never delay
  keyGenerator: keyGen
});
*/
var commentLimiter = new RateLimit({
  windowMs: 30 * 60 * 1000,
  max: 50,
  delayAfter: 0,
  keyGenerator: keyGen
});



/**
 * Returns all posts.
 */
router.get('/', function (request, response) {
  //'find' returns all objects matching the given query - and all objects match the empty query "{}".

  // Most db operations take a function as their second argument, which is called after the query completes. This
  // function executes after the operation finishes - if there's an error, the first argument (err) is true. If not,
  // the second argument (posts) contains our results.
  Post.find({}).where('removed').equals(false).sort('-date').limit(100).exec(function (err, posts) {
    if (err) {
      return response.status(500).send(); // db error (500 internal server error)
    }
    return response.status(200).send(Post.toClientBatch(request.user.userID, posts)); // success - send the posts!
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
          comment.votes.push({user: user, vote: req.body.vote});
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
router.put('/:post_id/vote', function (req, res) {
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
        post.votes.push({user: user, vote: req.body.vote});
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
router.post('/', function (req, res) {
  User.findById(req.user.userID, function (err, user) {
    if (err) return res.status(500).send();
    if (!user) return res.status(404).send();
    var reactCountsTemplate = {
      "angry": 0,
      "love": 0,
      "wow": 0,
      "funny": 0,
      "sad": 0
    };
    Post.create({
      _id: req.body.id,
      title: req.body.title,
      body: req.body.body,
      author: user,
      date: Date.now(),
      comments: [],
      votes: [],
      reacts: {},
      reactCounts: reactCountsTemplate
    }, function (err, post) {
      if (err) {
        console.log(err)
        return res.status(500).send();
      }
      return res.status(200).send(Post.toClient(user._id, post));
    });
  })
});


/**
 * Gets a single post.
 */
router.get('/:id', function (request, response) {
  Post.findById(request.params.id, function (err, post) {
    if (err) return response.status(500).send();
    if (!post) return response.status(404).send();
    return response.status(200).send(Post.toClient(request.user.userID, post));
  })
});


/**
 * Posts a comment.
 */
router.post('/:id/comments', commentLimiter, function (req, res) {
  // find user
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

          post.comments.push(comment);
          post.save(function (err, post) {
            console.log(err)
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
router.put('/:id', function (req, res) {

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

        if (!(Object.keys(req.body).every(function (prop) {
            return Post.schema.paths.hasOwnProperty(prop);
          }))) {
          return res.status(400).send("Given object does not match db format");
        }

        // extend the post (copies values from req.body onto post) and save it
        post = _.extend(post, req.body);
        post.save(function (err, post) {
          if (err) return res.status(500).send();
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

router.put('/:id/reacts', function (req, res) {
  User.findById(req.user.userID, function (err, user) {
    if (err) return res.status(500).send("internal db error");
    if (!user) return res.status(404).send("could not find user");

    Post.findById(req.params.id, function (err, post) {
      if (err) {
        console.log(err)
        return res.status(500).send("internal db error");
      }
      if (!post) return res.status(404).send("could not find post");
      react = req.body.react;
      console.log(react)
      console.log(req.params.id)

      
      console.log(react)
      //check if user has react; if so, delete and decrement
      if (react == "none") {
        console.log("here")
        oldReact = post.reacts[user._id];
        post.reactCounts[oldReact] -= 1;
      }
      else {
        post.reactCounts[react] += 1;
      }
      post.reacts[user._id] = react;

      /*
      if (post.reacts.hasOwnProperty(user._id)) {
        newReact = post.reacts[user._id] != react;
        oldReact = post.reacts[user._id];
        delete post.reacts[user._id];
        post.reactCounts[oldReact] -= 1;
      }
      if (newReact) {
        //add react to post's react map
        post.reacts[user._id] = react;
        post.reactCounts[react] += 1;
      }
      */
      post.markModified('reacts');
      post.markModified('reactCounts');

      //save post and send to front end
      post.save(function (err, post) {
        if (err) return res.status(500).send("could not save post");
        return res.status(200).send(post)
      })
    });
  })
})

//get map of reacts to css and counts
router.get('/:id/reacts/counts', function (req, res) {
  Post.findById(req.params.id, function (err, post) {
    if (err) {
      return res.status(500).send()
    }
    if (!post) {
      return res.status(404).send()
    }
    return res.status(200).send(JSON.stringify(post.reactCounts));
  })

});

//get map of users to reacts
router.get('/:id/reacts', function (req, res) {
  Post.findById(req.params.id, function (err, post) {
    if (err) {
      return res.status(500).send();
    }
    if (!post) return res.status(404).send();

    return res.status(200).send(JSON.stringify(post.reacts))
  })
});

module.exports = router;
