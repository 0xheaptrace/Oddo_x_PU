const crypto = require('crypto');

function randomSlug(bytes = 10) {
  return crypto.randomBytes(bytes).toString('hex').slice(0, 16);
}

module.exports = { randomSlug };
