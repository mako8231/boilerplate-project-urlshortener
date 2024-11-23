require('dotenv').config();
const dns = require('node:dns')

const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const data = require ('./shortenedURLs.json');
const fs = require('fs')

// Basic Configuration
const port = process.env.PORT || 3000;



app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res){
  const output = {
    original_url : '',
    short_url : ''
  }  
  console.log("Response: ", req.body.url)
  output.original_url = req.body.url.replace('https://', '');
  const hostName = getHost(output.original_url);
  //check if its a valid url
  console.log(hostName)
  dns.lookup(hostName, 4, function(errorMsg, addr, family) {
    if ((errorMsg != null) && (errorMsg.code === 'ENOTFOUND')){
      res.json({ error: 'invalid url' })
    } else {
      output.short_url = urlShortHash(output.original_url);
      data[`${output.short_url}`] = output.original_url;
      
      //Save json
      fs.writeFileSync('./shortenedURLs.json', JSON.stringify(data), 'utf8');
      res.json(output)
    }
  });
})

app.get('/api/shorturl/:short_url', (req, res) => {
  let short_url = req.params.short_url;
  console.log("entering the page...")
  if (data.hasOwnProperty(short_url)){
    res.redirect('https://'+data[short_url]);
  } else {
    res.json({ error: 'invalid url' });
  }
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function getHost(url) {
  let hostName = '';
  for (let i=0; i<url.length; i++){
    //console.log(url[i]);
    if (url[i] == '/') {break;}
    hostName += url[i];
  }

  return hostName;
}

function urlShortHash(url) {
  let hash = 0;
  for (let i=0; i<url.length; i++){
    let charCode = url.charCodeAt(i);
    hash += charCode;
  }
  
  return (hash%2000);
}
