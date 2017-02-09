'use strict';

const _ = require('lodash');
const crypto = require('crypto');

// Remove keys that starts with _ and (non-number and non-string)
function filterObject(obj) {
  const signKeys = _.keys(obj).filter(str => !str.startsWith('_') && (_.isNumber(obj) || _.isString(obj)));
  return _.pick(obj, signKeys);
}

// Used for middleware authorization
function _sign(obj, secret) {
  const plainText = Object.keys(filterObject(obj))
    .sort()
    .reduce((result, key) => { return result.concat([encodeURIComponent(obj[key])]); }, [])
    .concat([secret])
    .join(':');

  console.log(plainText);
  return crypto.createHash('sha512').update(plainText).digest('hex').toLowerCase();
}

// Client server sign
function sign(obj, secret) {
  console.log(obj)
  const nonce = Math.random().toString(36);
  const timestamp = parseInt(Date.now() / 1000, 10);
  const signature = _sign(_.assign({}, filterObject(obj), { nonce, timestamp }), secret);
  return { nonce, timestamp, signature };
}

module.exports = sign;
