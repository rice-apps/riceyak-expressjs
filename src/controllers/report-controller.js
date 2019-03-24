var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var User = require('../models/user');
var PostReport = require('../models/post-report');
var CommentReport = require('../models/comment-report');
var Post = require('../models/post');
var Comment = require('../models/comment')
var authMiddleWare = require('../middleware/auth-middleware'); // auth checker
router.use(authMiddleWare);
router.use(bodyParser.json());

/**
 * Posts a post report.
 */
router.post('/posts', function (req, res) {
  Post.findById(req.body.id, function (err, post) {
    if (err) return res.status(500).send();
    if (!post) return res.status(404).send();

    PostReport.create(
      {
        type: req.body.type,
        reason: req.body.reason,
        postid: req.body.id,
      }, function (err) {
        if (err) return res.status(500).send();
        return res.status(200).send();
      })
  });
});

/**
 * Posts a comment report.
 */
router.post('/comments', function (req, res) {

  Comment.findById(req.body.id, function (err, post) {
    if (err) return res.status(500).send();
    if (!post) return res.status(404).send();

    CommentReport.create(
      {
        type: req.body.type,
        reason: req.body.reason,
        postid: req.body.id,
      }, function (err) {
        if (err) return res.status(500).send();
        return res.status(200).send();
      })
  });
});

/**
 * Get all the reports.
 */
router.get('/', function (req, res) {
  User.findById(req.user.userID, function (err, user) {
    if (err) return res.status(500).send();
    if (!user) return res.status(404).send();

    if (user.is_admin) {
      Report.find({}).exec(function (err, reports) {
        if (err) {
          return res.status(500).send();
        }
        return res.status(200).send(reports)
      });
    }
    else {
      return res.status(401).send();
    }
  })
});

/**
 * Review a report
 */
router.put('/', function (req, res) {
  User.findById(req.user.userID, function (err, user) {
    if (err) return res.status(500).send();
    if (!user) return res.status(404).send();

    if (user.is_admin) {
      Report.findById(req.body.report._id, function (err, report) {
        report.reviewed = true;
        if (req.body.result === false) {
          Post.findById(req.body.report.post._id, function (err, post) {
            post.removed = true;
            post.save(function (err) {
              if (err) return res.status(500).send();
            })
          })
        }
        report.save(function (err) {
          if (err) return res.status(500).send();
          return res.status(200).send(report);
        })
      })
    }
  })
});

module.exports = router;
