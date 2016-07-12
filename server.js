const HTTP = require( 'http' );
const fs = require( 'fs' );
const path = require( 'path' );
const url = require( 'url' );
const querystring = require( 'querystring' );
const favicon = require( 'serve-favicon' );
const _favicon = favicon( __dirname + '/public/favicon.ico' );

const server = HTTP.createServer( ( req, res ) => {
  console.log( req.method );
  if( req.method === 'GET' ) {
    getMethod( req, res );
  } else if( req.method === 'POST' ) {
    updateIndexHtml(req, res );
    postMethod( req, res );
  } else if( req.method === 'PUT' ) {
    putMethod( req, res );
  } else if( req.method === 'DELETE' ) {
    deleteElementFromIndex( req, res );
    deleteMethod( req, res );
  }
});

const getMethod = ( req, res ) => {
  fs.readFile(req.url, ( err, data ) => {
    if( err === null ) {
      res.write( fs.readFileSync( 'public/404.html' ) );
      res.end();
    } else {
      if( req.url === '/' || undefined ) {
        req.url = '/index.html';
      }
      res.write( fs.readFileSync(`public${req.url}`) );
      res.end();
    }
  });
};

const postMethod = ( req, res ) => {
  req.on( 'data', ( data ) => {
    let reqBody = querystring.parse( data.toString() );
    res.writeHead( 200, {
     'Content-type' : 'application/json',
     'success' : true});
    fs.writeFile(`public${req.url}`, htmlTemplate( reqBody ));
    res.end();
  });
};

const putMethod = ( req, res ) => {
  fs.readFile( `public${req.url}`, ( err, data ) => {
    if( err !== null ) {
      res.writeHead( 500, {
       'Content-type':'application/json',
       'error':`resource ${req.url} does not exist`,
      });
      res.end();
    } else {
      postMethod( req, res );
    }
  });
};

const deleteMethod = ( req, res ) => {
  fs.readFile( `public${req.url}`, ( err, data ) =>{
    if( err !== null ){
      res.writeHead( 500, {
       'Content-type':'application/json',
       'error':`resource ${req.url} does not exist`,
      });
      res.end();
    } else {
      fs.unlink(`public${req.url}`);
      res.end();
    }
  });
};

const updateIndexHtml = ( req, res ) => {
  req.on( 'data', (data) => {
    const reqBody = querystring.parse( data.toString() );
    fs.readFile( 'public/index.html', ( err, data ) => {
      let indexHtmlString = data.toString();
      indexHtmlString = indexHtmlString.replace('</ol>',
  `  <li><a href="${req.url}">${reqBody.elementName}</a></li>
  </ol>`);
      let findTheNum = indexHtmlString.indexOf(`</h3>`);
      let numOfElements = parseFloat( indexHtmlString.charAt(findTheNum-1) );
      let incrementNumElements = ++numOfElements;
      let htmlArray = indexHtmlString.split('\n');
      htmlArray.splice( 10, 1, `<h3>These are ${incrementNumElements}</h3>` );
      indexHtmlString = htmlArray.join( `\n` );
      fs.writeFile( 'public/index.html', indexHtmlString, 'utf8' );
    });
  });
};

const deleteElementFromIndex = ( req, res ) => {
  req.on('data', (data) => {
    const reqBody = querystring.parse(data.toString());
    fs.readFile('public/index.html', ( err, data ) => {
      let indexHtmlString = data.toString();
      indexHtmlString = indexHtmlString.replace(
`  <li><a href="${req.url}">${reqBody.elementName}</a></li>`, ''); // weird spaces showing up in place of <li> tag, how get rid brah????

      let findTheNum = indexHtmlString.indexOf(`</h3>`);
      let numOfElements = parseFloat( indexHtmlString.charAt(findTheNum-1) );
      let decrementNumElements = --numOfElements;
      let htmlArray = indexHtmlString.split('\n');
      htmlArray.splice( 10, 1, `  <h3>There are ${decrementNumElements}</h3>` );
      indexHtmlString = htmlArray.join(`\n`);
      fs.writeFile( 'public/index.html', indexHtmlString, 'utf8' );
    });
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

server.listen('8080', () => {
  console.log('Listening on port 8080');
});