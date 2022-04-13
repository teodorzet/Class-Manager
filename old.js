const http = require('http');

const server = http.createServer((req, res) => {
    //route
    let data = '';
    req.on('data', chunk => {
        data += chunk;
        // console.log(`${chunk}`);
    })
    req.on('end', () => {
        var responseJson = {};
        try {
            var objReq = JSON.parse(data);
            req.body = objReq

        } catch (err) {
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify({
                succes: false,
                error: err.message
            }))
            res.end();
            return;
        }
        if (req.method == `POST` && req.url == `/api`) {
            if (objReq.merge) {
                responseJson.succes = true;
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(responseJson));
                res.end();
            } else {
                responseJson.succes = false;
                res.statusCode = 300;
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(responseJson))
                res.end();
            }
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify({
                succes: false,
                message: `invalid path`
            }));
            res.end();
        }
    });
    req.on('error', () => {
        console.error(err);
        res.end();
    })
})
server.listen(4002);

console.log(`server started on port 4002`);