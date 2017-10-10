require('es6-promise').polyfill();
const axios = require('axios');

const REPO_OWNER = 'yourtion';
const REPO_NAME = 'reading';
const REPO_ID = 105520376;

module.exports = (app) => {

  app.get('/hello', (req, res) => {
    res.end('Hello Yourtion');
  });

};

