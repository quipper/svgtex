// this script will set up a HTTP server on this port (local connections only)
// and will receive POST requests (not urlencoded)
var PORT = parseInt(require('system').env.PORT) || 16000;

// server will process this many queries and then exit. (-1, never stop).
var REQ_TO_LIVE = -1;

var server = require('webserver').create();
var page = require('webpage').create();
var args = require('system').args;
var activeRequests = {};
var service = null;

var contentTypeFor = {
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'err': 'err'
};

if (args.length > 1) {
  PORT = args[1];
}

// thanks to:
// stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
function utf8_strlen(str) {
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}
 
function requested_format(url) { 
  if(url.indexOf('/png') === 0) {
    return 'png';
  } else if(url.indexOf('/svg') === 0) {
    return 'svg';
  } else { 
    return 'err';
  }
}

page.onCallback = function(data) {
  var record = activeRequests[data[0]];
  var resp = record[0];

  var format = record[2];

  if(format === 'png' && data[1] !== 'error') {
    page.clipRect = data[1];
    data[1] = page.renderBase64('png');
  }

  var t = ', took ' + (((new Date()).getTime() - record[1])) + 'ms.';

  if ((typeof data[1]) === 'string' && data[1] !== 'error') {
    resp.statusCode = 200;
    resp.setHeader("Content-Type", contentTypeFor[format]);
    resp.setHeader("Content-Length", utf8_strlen(data[1]));
    resp.write(data[1]);
    console.log(data[0].substr(0, 30) + '.. ' +
        data[0].length + 'B query, OK ' + data[1].length + 'B result' + t);
  } else {
    resp.statusCode = 400;
    resp.write(data[1][0]);
    console.log(data[0].substr(0, 30) + '.. ' +
        data[0].length + 'B query, ERR ' + data[1][0] + t);
  }
  resp.close();
  delete activeRequests[data[0]]; // Free up memory

  if (!(--REQ_TO_LIVE)) {
    phantom.exit();
  }
}

console.log("loading bench page");
page.open('index.html', function (status) {

  service = server.listen('0.0.0.0:' + PORT, function(req, resp) {
    var format = requested_format(req.url);

    var contentType = req.headers['Content-Type'],
        query;

    resp.setHeader("Access-Control-Allow-Origin", req.headers.Origin);

    if (req.method == 'GET') {
      // URL starts with /svg? or /png? and is urlencoded.
      query = unescape(req.url.substr(5));
    } else {
      if (contentType === 'application/x-www-form-urlencoded') {
        query = req.postRaw;
      } else {
        query = req.post;
      }
    }
    activeRequests[query] = [resp, (new Date()).getTime(), format];
    // this is just queueing call, it will return at once.

    page.evaluate(function(q, f) {
      window.engine.process(q, f, window.callPhantom);
    }, query, format);
  });

  if (!service) {
    console.log("server failed to start on port " + PORT);
    phantom.exit(1);
  } else {
    console.log("server started on port " + PORT);
    console.log("you can post to the server at http://localhost:" + PORT + "/");
    console.log(".. or by sending tex source in POST (not url encoded)");
  }
});


