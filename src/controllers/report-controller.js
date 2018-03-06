var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var User = require('../models/user');
var Report = require('../models/report');
var authMiddleWare = require('../middleware/auth-middleware'); // auth checker
router.use(authMiddleWare);
router.use(bodyParser.json());

/**
 * Posts a report.
 */
router.post('/',function (req, res)  {
    User.findById(req.user.userID, function(err, user){
        if (err) return res.status(500).send();
        if (!user) return res.status(404).send();
        Report.create(
            {
                reason: req.body.reason,
                author: user,
                post: req.body.post_id,
                reviewed: false
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

module.exports = router;
