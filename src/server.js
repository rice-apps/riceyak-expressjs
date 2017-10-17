var app = require('./app');
var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
    console.log('RiceYak backend listening on port ' + port);
});

module.exports = server;