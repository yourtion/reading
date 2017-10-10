const axios = require('axios');
const express = require('express');
const webtask = require('webtask-tools');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const REPO_OWNER = 'yourtion';
const REPO_NAME = 'reading';
const REPO_ID = 105520376;

app.get('/test', (req, res) => {
  res.end('Hello Yourtion');
});

module.exports = webtask.fromExpress(app);
