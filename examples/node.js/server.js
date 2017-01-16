'use strict';

const appKey = 'shimo-sdk-test-key';
const secret = 'shimo-sdk-test-secret';

const http = require('http');
const koa = require('koa');
const serve = require('koa-static');
const router = require('koa-router')();
const views = require('koa-views');
const bodyParser = require('koa-bodyparser');
const sign = require('./lib/sign');
const app = koa();
app.use(bodyParser());
router.get('/', function *() {
  yield this.render('index', {
    appKey: appKey,
    user: {
      id: 1,
      name: 'Tom',
      avatar: 'https://dn-shimo-avatar.qbox.me/7JJPV7OrVSKHZUpb.jpeg!avatar'
    },
    sdkJsUrl: 'https://assets-cdn.shimo.im/assets/scripts/sdk-1.0.0.alpha.js'
  });
});

// Recieve merged formData & queryString, return { signature, nonce, timestamp }
router.post('/sign', function *() {
  this.body = sign(this.request.body, secret);
});

app.use(views('views', { map: { html: 'ejs' } }));
app.use(router.routes());

const port = process.env.PORT || 3012;
http.createServer(app.callback()).listen(port, function () {
  console.log(`Listening port ${port}...`);
});
