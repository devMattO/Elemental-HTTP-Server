const HTTP = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const server = HTTP.createServer((req,res)=>{
  if(req.method === 'GET'){
    getMethod( req, res );
  }
});

server.listen('8080', () => {
  console.log('Listening on port 8080');
});

const getMethod = ( req, res ) => {
  fs.readFile(req.url, (err,data)=>{
    if(err){
      res.write(fs.readFileSync('public/404.html'));
      res.end();
    }else{
      res.write(fs.readFileSync('public' + req.url));
      res.end();
    }
  });
};