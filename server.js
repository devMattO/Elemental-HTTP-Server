const HTTP = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const server = HTTP.createServer((req,res)=>{
  console.log(req.method);
  if(req.method === 'GET'){
    getMethod( req, res );
  }else if(req.method === 'POST'){
    postMethod( req, res );
  }
});

server.listen('8080', () => {
  console.log('Listening on port 8080');
});

const getMethod = ( req, res ) => {
  fs.readFile(req.url, (err, data)=>{
    if(err === null){
      res.write(fs.readFileSync('public/404.html'));
      res.end();
    }else{
      if(req.url === '/' || undefined){
        req.url = '/index.html';
      }
      res.write(fs.readFileSync('public' + req.url));
      res.end();
    }
  });
};

const postMethod = ( req, res ) => {
  req.on('data', (data)=>{
    let reqBody = querystring.parse(data.toString());
    fs.writeFile('public' + req.url, htmlTemplate(reqBody));
    updateIndexHtml(req, res, reqBody );
    res.end();
  });
};

const updateIndexHtml = ( req, res, obj ) =>{
    fs.readFile('public/index.html', (err, data)=>{
      let indexHtmlString = data.toString();
      indexHtmlString = indexHtmlString.replace('</ol>',
      `  <li>
        <a href="${req.url}">${obj.elementName}</a>
    </li>
  </ol>`);
      let findTheNum = indexHtmlString.indexOf(`</h3>`);
      let numOfElements = parseFloat(indexHtmlString.charAt(findTheNum-1));
      let incrementNumElements = ++numOfElements;
      let htmlArray = indexHtmlString.split('\n');
      htmlArray.splice(10,1,`  <h3>There are ${incrementNumElements}</h3>`);
      indexHtmlString = htmlArray.join(`\n`);
      fs.writeFile('public/index.html', indexHtmlString, 'utf8');
    });
};


const htmlTemplate = ( reqBody ) => (

  `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>The Elements - ${reqBody.elementName}</title>
    <link rel="stylesheet" href="/css/styles.css">
  </head>
    <body>
      <h1>${reqBody.elementName}</h1>
      <h2>${reqBody.elementSymbol}</h2>
      <h3>Atomic number ${reqBody.elementAtomicNumber}</h3>
      <p>${reqBody.elementDescription}</p>
      <p><a href="/">back</a></p>
    </body>
  </html>`

);