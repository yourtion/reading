const express = require('express');
const webtask = require('webtask-tools');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

require('./routes/reading')(app);

module.exports = webtask.fromExpress(app);
