const path = require('path')
const express = require('express');
const app = express();

const IP = process.env.IP || '0.0.0.0';
const PORT = process.env.PORT || 8080;
const searchLyrics = require('./searchLyrics');

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// app.use('*', (req, res) => {
//   res.sendFile(path.join(__dirname,'views/index.html'))
// })
app.get('/search', (request, response) => {
  const listId = request.query.list;
  if(listId != null){
    searchLyrics("PLfe2uTiC7lz-xG0N50SVCmpJ9-MrW5VpU")
    .then(results => {
      console.log(results)
        response.status(200);
        response.json(results);
    });
  }else{
    response.end();
  }
});

app.get('/', (req, res) => res.status(200).render('index'));

app.listen(PORT, IP);