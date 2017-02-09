'use strict';

const appKey = 'shimo-sdk-test-key';
const secret = 'shimo-sdk-test-secret';

const http = require('http');
const koa = require('koa');
const is = require('type-is');
const router = require('koa-router')();
const views = require('koa-views');
const bodyParser = require('koa-bodyparser');
const sign = require('./lib/sign');
const upload = require('./lib/upload');
const app = koa();

app.use(function *(next) {
  // Multipart request will be handled by lib/upload_file
  if (is(this.req, ['multipart'])) {
    yield upload.single(this, 'file');
    this.request.body = this.request.body || {};
    _.assign(this.request.body, this.req.body || {});
    yield next;
  } else {
    yield bodyParser.bind(this)(next);
  }
});

router.get('/', function *() {
  yield this.render('index', {
    appKey: appKey,
    user: {
      id: 1,
      name: 'Tom',
      avatar: 'https://dn-shimo-avatar.qbox.me/7JJPV7OrVSKHZUpb.jpeg!avatar'
    },
    sdkJsUrl: 'https://assets-cdn.shimo.im/assets/scripts/sdk-1.0.0.alpha.debug.js'
    // sdkJsUrl: 'http://localhost:3011/dist/sdk-1.0.0.alpha.js'
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
