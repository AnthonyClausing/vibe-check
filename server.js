const express = require('express');
const app = express();

const IP = process.env.IP || '0.0.0.0';
const PORT = process.env.PORT || 8080;

const searchLyrics = require('./searchLyrics');

app.get('/search', (request, response) => {
  const listId = request.query.list;
  if(listId != null){
    searchLyrics("PLfe2uTiC7lz-xG0N50SVCmpJ9-MrW5VpU")
    .then(results => {
        response.status(200);
        response.json(results);
    });
  }else{
    response.end();
  }
});

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(PORT, IP);