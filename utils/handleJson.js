function responseJSON(res, responseBody) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(responseBody))
    res.end()
}

function requestJSON(req, res, callback) {
    let data = '';
    let objReq = ''
    req.on('data', chunk => {
        data += chunk;
        // console.log(`${chunk}`);
    })
    req.on('end', () => {
        try {
            objReq = JSON.parse(data);
            callback(objReq)
            return
        } catch (err) {
            console.log(err)
            console.log(data)
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify({
                error: err.message,
                data: data
            }))
            return
        }
    })
    req.on('error', () => {
        console.error(err)
        return
    })
}


module.exports = { requestJSON, responseJSON }