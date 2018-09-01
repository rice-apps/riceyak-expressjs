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

User.update({},
            {is_banned: 0},
            {multi: true}).exec()

router.get('/ban', function (req, res) {
    User.find({}).where('is_banned').equals(1).exec(function (err, users) {
        if(err) return res.status(500).send()
        console.log(users)
        return res.status(200).send(users)
    })
})

router.put('/ban',function (req,res) {
    user_id = req.body.user
    console.log(req.body.ban)
    User.findByIdAndUpdate(user_id,{is_banned: req.body.ban},function (err,user) {
        if(err) return res.status(500).send()
        if(!user) return res.status(404).send()
        User.find({}).where('is_banned').equals(1).exec(function (err, users) {
            if(err) return res.status(500).send()
            console.log(users)
            return res.status(200).send(users)

        })
    })

})

module.exports = router