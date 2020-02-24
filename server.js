
const express = require('express');
const app = express();
//signaling server URL
const url = "https://example_url.fi:XXXXX";
var http = require('http').Server(app);

app.use(express.static('public'));


http.listen(3000, function() {
    console.log("listening on *:3000");
});

