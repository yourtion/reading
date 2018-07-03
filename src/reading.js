'use latest';
const axios = require('axios');
const express = require('express');
const webtask = require('webtask-tools');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const REPO_OWNER = 'yourtion';
const REPO_NAME = 'reading';
const REPO_ID = 105520376;

const RELEASE_ID = '59dc65db0614f961b3e33e9d';
const MILESTONE_ID = 2;

app.get('/test', (req, res) => {
  res.end('Hello Yourtion');
});

app.post('/add', (req, res) => {
  const { GITHUB_ACCESS_TOKEN, ZENHUB_ACCESS_TOKEN, ZENHUB_ACCESS_TOKEN_V4 } = req.webtaskContext.secrets;
  const { action, issue } = req.body;
  if(!issue) return res.json({ message: 'ok!' });
  const { url, html_url, number } = issue;

  console.info(`[BEGIN] issue updated with action: ${ action }`);

  if (action === 'opened') {

    return axios.patch(`${ url }?access_token=${ GITHUB_ACCESS_TOKEN }`, { milestone: MILESTONE_ID })
      .then(() => console.info(`[END] set milestone successful! ${ html_url }`))
      .catch((e) => res.json(e));

  } else if (action === 'milestoned') {

    axios.put(`https://api.zenhub.io/p1/repositories/${ REPO_ID }/issues/${ number }/estimate?access_token=${ ZENHUB_ACCESS_TOKEN }`, { estimate: 1 })
      .then(() => console.info(`[END] Set estimate successful! ${ html_url }`))
      .catch((e) => console.error(`[END] Failed to set estimate! ${ html_url }`, e));

    axios({
      method: 'post',
      url: `https://api.zenhub.io/v4/reports/release/${ RELEASE_ID }/items/issues?access_token=${ ZENHUB_ACCESS_TOKEN_V4 }`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `add_issues%5B0%5D%5Bissue_number%5D=${ number }&add_issues%5B0%5D%5Brepo_id%5D=${ REPO_ID }`,
    })
    .then(() => console.info(`[END] set release successful! ${ html_url }`))
    .catch((e) => console.error(`[END] Failed to set release! ${ html_url }`, e));

  }

  res.json({ message: 'issue updated!' });
});

app.post('/close', (req, res) => {
  const { GITHUB_ACCESS_TOKEN } = req.webtaskContext.secrets;

  console.info('[BEGIN]', req.query);
  const { title } = req.query;

  const keyword = encodeURIComponent(title.replace(/[^\sa-zA-Z0-9_\u4e00-\u9fa5]/g, '+').replace(/\s/g, '+'));
  console.info('[KEYWORD]', keyword);
  
  if(!title || !keyword) return res.json({error: "no title"});

  return axios.get(`https://api.github.com/search/issues?q=${ keyword }%20repo:${ REPO_OWNER }/${ REPO_NAME }`)
    .then(({ data }) => {
      console.info('[RESULT]', data);
      if (data.total_count > 0) {
        const { url, html_url } = data.items[0];
        return axios.patch(`${ url }?access_token=${ GITHUB_ACCESS_TOKEN }`, { state: 'closed', title: title })
          .then(() => {
            console.info(`[END] issue closed successful! ${ html_url }`)
            return res.json({ message: 'Closed issue successful!' });
          });
      } else {
        return axios.post(`https://api.github.com/repos/${ REPO_OWNER }/${ REPO_NAME }/issues?access_token=${ GITHUB_ACCESS_TOKEN }`, { title })
          .then(({ url, html_url }) => {
            console.info(`[END] issue created successful! ${ html_url }`);
            return axios.patch(`${ url }?access_token=${ GITHUB_ACCESS_TOKEN }`, {
              headers: { 'Content-Type': 'application/json' },
              data: { state: 'closed' },
            }).then(() => {
              console.info(`[END] issue closed successful! ${ html_url }`)
              return res.json({ message: 'Closed issue successful!' });
            })
          });
      }
      return res.json({ error: 'Finished achieve reading item!' });
    })
    .catch(err => res.json({ error: err }));
});

module.exports = webtask.fromExpress(app);
