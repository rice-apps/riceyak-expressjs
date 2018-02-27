var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var https = require('https');
var request = require('request');
var xmlParser = require('xml2js').parseString;
var stripPrefix = require('xml2js').processors.stripPrefix;
var shajs = require('sha.js');

var config = require('../config');

var User = require('../models/user');

router.use(bodyParser.json());

/**
 * After the browser is redirected by the IDP, the frontend takes the ticket off the URL and sends a GET
 * request to the backend, here, with the ticket as a query parameter. Here, we validate the ticket against
 * the CAS server and then parse the response to see if we succeeded, and let the frontend know.
 */
router.get('/', function (req, res) {

  var ticket = req.query.ticket;

  if (ticket) {

    // validate our ticket against the CAS server
    var url = `${config.CASValidateURL}?ticket=${ticket}&service=${config.thisServiceURL}`;
    request(url, function (err, response, body) {
      if (err) res.status(500).send();

      // parse the XML. tagNameProcessors: [stripPrefix] to strip XML prefixes and explicitArray: false
      // to prevent one-item arrays from being created from the XML.
      xmlParser(body, { tagNameProcessors: [ stripPrefix ], explicitArray: false }, function (err, result) {
        if (err) return res.status(500);

        var serviceResponse = result.serviceResponse;
        var authSucceeded = serviceResponse.authenticationSuccess;

        if (authSucceeded) {

          // see if this netID exists as a user already. if not, create one.
          // we find the SHA256 hash of the username, because usernames are stored as hashes for security.
          var hashedUsername = shajs('sha256').update(authSucceeded.user).digest('hex');

          User.findOne({ username: hashedUsername }, function (err, user) {
            if (err) return res.status(500);

            // if the user does not exist, create a new one
            if (!user) {
              User.create({ username: hashedUsername }, function (err, newUser) {
                if (err) return res.status(500);

                // create their avatar URL
                newUser.avatar_url = `https://api.adorable.io/avatars/128/${newUser._id}`;

                newUser.save(function (err, u) {
                  if (err) return res.status(500).send();
                });

                // here, we create a token with the user's info as its payload.
                // authSucceded contains: { user: <username>, attributes: <attributes>}
                var token = jwt.sign({data: authSucceeded, userID: newUser._id}, config.secret);
                sendJSON(res, newUser._id, token, newUser.avatar_url, true);
              });

            // if they do exist, create a token with the user's info
            } else {
              var token = jwt.sign({data: authSucceeded, userID: user._id}, config.secret);
              sendJSON(res, user._id, token, user.avatar_url, false);
            }
          });

        } else if (serviceResponse.authenticationFailure) {
          res.status(401).json({success: false, message: 'CAS authentication failed'});

        } else {
          res.status(500).send();
        }
      });
    });

  } else {
    return res.status(400).send();
  }
});

var sendJSON = function (res, userID, token, avatarURL, isNew) {
  // send our token to the frontend! now, whenever the user tries to access a resource, we check their
  // token by verifying it and seeing if the payload (the username) allows this user to access
  // the requested resource.
  res.json({
    success: true,
    message: 'CAS authentication success',
    user: {
      userID: userID,
      token: token,
      avatarURL: avatarURL,
      isNew: isNew
    }
  });
};


module.exports = router;
