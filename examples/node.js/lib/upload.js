'use strict';

const Promise = require('bluebird');
const multer = require('multer')({
  dest: 'uploads/',
  limits: {
    // fileSize: 5 * 1024 * 1024 * 1024 * 1024
  }
});

['any', 'array', 'fields', 'none', 'single'].forEach(function (method) {
  exports[method] = function (ctx) {
    const args = [].slice.call(arguments, 1);
    const fn = multer[method];
    const middleware = fn.apply(multer, args);
    return Promise.promisify(middleware)(ctx.req, ctx.res);
  };
});
