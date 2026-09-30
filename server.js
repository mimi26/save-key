/*
  write a program that runs a server that is accessible on http://localhost:4000/.
  When your server receives a request on http://localhost:4000/set?somekey=somevalue
  it should store the passed key and value in memory. When it receives a request on
  http://localhost:4000/get?key=somekey it should return the value stored at somekey.
*/
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

  // 'set' endpoint:
  if (url.pathname === '/set') {
    for (const [key, val] of url.searchParams) {
      // if key or value isn't present
      if (!key || !val) {
        res.statusCode = 400;
        return res.end('Key and value required');
      }

      res.statusCode = 200;
      // if key already exists, update existing key/value with new value
      if (Object.keys(keys).includes(key)) {
        keys[key] = val;
        return res.end('Key updated!')
      }

      // all good: update keys object with new key/value.
      keys = { ...{ [key]: val }, ...keys };
      return res.end('Key received!');
    }
    // 'get' endpoint
  } else if (url.pathname === '/get') {
    for (const [queryKey, key] of url.searchParams) {
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
