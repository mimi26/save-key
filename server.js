const http = require('node:http');

const hostname = 'localhost';
const port = 4000;
const baseURL = `http://${hostname}:${port}/`;

let keys = {};

const server = http.createServer((req, res) => {
  req
    .on('error', err => {
      console.error(err);
    });

  const url = new URL(req.url, baseURL);
  console.log('***** ~ keys:', keys);

  // ensure correct url format
  if (url.searchParams.size === 0) {
    res.statusCode = 404;
    return res.end('Incorrectly formatted query.')
  }
  const paramEntries = url.searchParams.entries();

  // 'set' endpoint:
  if (url.pathname === '/set') {
    // /set?somekey=somevalue
    for (const [key, val] of paramEntries) {
      // key or value isn't present
      if (!key || !val) {
        res.statusCode = 400;
        return res.end('key and value required');
      }
      res.statusCode = 200;

      // if key already exists, update existing key/value with new value
      if (Object.keys(keys).includes(key)) {
        keys[key] = val;
        return res.end('key updated!')
      }

      // all good: update keys object with new key/value.
      keys = { ...{ [key]: val }, ...keys };
      console.log('keys:', keys)
      return res.end('key received!');
    }
    // 'get' endpoint
  } else if (url.pathname === '/get') {
    for (const [queryKey, key] of paramEntries) {
      // ensure correctly formatted query
      if (queryKey !== 'key') {
        return res.end('Queries must be formatted with keyword "key".');
      }

      if (!Object.keys(keys).includes(key)) {
        res.statusCode = 404;
        return res.end('Sorry, your key could not be found. Please try a different key.');
      }
      // all good: lookup the value of requested key.
      res.statusCode = 200;
      const val = keys[key];
      return res.end(`The value of ${key} is ${val}`);
    }
  } else {
    res.statusCode = 404;
    return res.end('Incorrectly formatted query.')
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at ${baseURL}`);
});
