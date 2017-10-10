'use latest';
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

const RELEASE_ID = '59dc65db0614f961b3e33e9d';
const MILESTONE_ID = 1;

app.get('/test', (req, res) => {
  res.end('Hello Yourtion');
});

app.post('/reading', (req, res) => {
  const { GITHUB_ACCESS_TOKEN, ZENHUB_ACCESS_TOKEN, ZENHUB_ACCESS_TOKEN_V4 } = req.webtaskContext.secrets;
  const { action, issue } = JSON.parse(req.body.payload);
  const { url, html_url, number } = issue;

  console.info(`[BEGIN] issue updated with action: ${ action }`);

  if (action === 'opened') {

    axios.patch(`${ url }?access_token=${ GITHUB_ACCESS_TOKEN }`, {
      headers: { 'Content-Type': 'application/json' },
      data: { milestone: MILESTONE_ID },
    }).then(() => console.info(`[END] set milestone successful! ${ html_url }`)).catch((e) => res.json(e));

  } else if (action === 'milestoned') {

    axios.put(`https://api.zenhub.io/p1/repositories/${ REPO_ID }/issues/${ number }/estimate?access_token=${ ZENHUB_ACCESS_TOKEN }`, {
      headers: { 'Content-Type': 'application/json' },
      data: { estimate: 1 },
    }).then(() => console.info(`[END] Set estimate successful! ${ html_url }`)).catch((e) => console.error(`[END] Failed to set estimate! ${ html_url }`, e));

    axios.post(`https://api.zenhub.io/v4/reports/release/${ RELEASE_ID }/items/issues?access_token=${ ZENHUB_ACCESS_TOKEN_V4 }`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `add_issues%5B0%5D%5Bissue_number%5D=${ number }&add_issues%5B0%5D%5Brepo_id%5D=${ REPO_ID }`,
    }).then(() => console.info(`[END] set release successful! ${ html_url }`)).catch((e) => console.error(`[END] Failed to set release! ${ html_url }`, e));

  }
  
  res.json({ message: 'issue updated!' });
});

module.exports = webtask.fromExpress(app);
