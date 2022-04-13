const http = require('http')
var parseCookies = require(`../utils/cookieParser`)
const { port } = require('../utils/port')
const url = require('url');
const path = require('path');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const json = require(`../utils/handleJson`)
const jwt = require('jsonwebtoken');
var config = require(`../utils/config`)

class WebApp {
    constructor(port, router) {
        this.port = port
        this.router = router
    }

    use() {}

    listen() {
        var app = this
        var server = http.createServer(function(req, res) {
            if (req.url.startsWith("/api")) {
                if (!req.url.startsWith("/api/auth") && !req.url.startsWith("/api/register")) {
                    console.log(`${req.method} ${req.url} auth required`);
                    var token = parseCookies.parseCookies(req);
                    if (!token) {
                        res.statusCode = StatusCodes.UNAUTHORIZED
                        json.responseJSON(res, {
                            error: `no auth`
                        })
                        return
                    } else {
                        try {
                            jwt.verify(token.myCookie, config.secret)
                        } catch (error) {
                            console.log(`cannot decode cookie. error:`)
                            console.log(error)
                            json.responseJSON(res, {
                                error: `no auth`
                            })
                            return
                        }
                    }
                    // console.log(token)
                }
                console.log(`${req.method} ${req.url}`);
                app.router.route(req, res)
            } else {

                // static

                // parse URL
                const parsedUrl = url.parse(req.url);
                // extract URL path
                let pathname = `./public${parsedUrl.pathname}`;
                if (pathname == `./public/`) {
                    pathname = `./public/index.html`
                }
                // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                const ext = path.parse(pathname).ext;

                console.log(`STATIC HANDLE` + pathname)
                    // maps file extention to MIME typere
                const map = {
                    '.ico': 'image/x-icon',
                    '.html': 'text/html',
                    '.js': 'text/javascript',
                    '.json': 'application/json',
                    '.css': 'text/css',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.wav': 'audio/wav',
                    '.mp3': 'audio/mpeg',
                    '.svg': 'image/svg+xml',
                    '.pdf': 'application/pdf',
                    '.doc': 'application/msword'
                };



                fs.exists(pathname, function(exist) {
                    if (!exist) {
                        // if the file is not found, return 404
                        res.statusCode = 404;
                        console.error(`file not found: ${pathname}`)
                        res.end(`File ${pathname} not found!`);
                        return;
                    }

                    // if is a directory search for index file matching the extention
                    if (fs.statSync(pathname).isDirectory()) {
                        res.statusCode = 400
                        res.setHeader('Content-Type', 'application/json');
                        res.write(JSON.stringify({
                            succes: false,
                            error: err.message
                        }))
                        res.end()
                    }

                    // read file from file system
                    fs.readFile(pathname, function(err, data) {
                        if (err) {
                            res.statusCode = 500;
                            res.end(`Error getting the file: ${err}.`);
                        } else {
                            // if the file is found, set Content-type and send data
                            res.setHeader('Content-type', map[ext] || 'text/plain');
                            res.end(data);
                        }
                    });
                });

            }
        })
        server.listen(port)
        console.log(`app running on PORT: ${port}`)
    }
}

module.exports = { WebApp }