function responseJSON(res, responseBody) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(responseBody))
    res.end()
}
module.exports = { responseJSON }