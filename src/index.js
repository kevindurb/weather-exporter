import http from 'http';

const server = http.createServer((request, response) => {
  response.write('hello world');
  response.end();
});

server.listen(8080);
