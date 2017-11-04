var jwt = require('jsonwebtoken');

var config = require('../config');

var authMiddleWare = function(req, res, next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                return res.status(401).json({ success: false, message: 'Failed to authenticate token' });
            } else {
                req.user = decoded.data;
                next();
            }
        });
    } else {
        return res.status(401).send({
            success: false,
            message: 'No token provided.'
        });
    }
};

module.exports = authMiddleWare;