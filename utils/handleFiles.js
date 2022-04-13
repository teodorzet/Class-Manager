const { parse } = require('querystring');
const fs = require('fs')
const path = require('path');
const { StatusCodes } = require('http-status-codes');
getUploadFile = async (req, res, filename) => {
    
    
    const writeStream = fs.createWriteStream(`./user_files/${filename}`);
    req.on('data', chunk => {
        writeStream.write(chunk);
    });
    req.on('end', () => {
        writeStream.end()
        return true
    });
    req.on('error', err => {
        writeStream.end()
        fs.createWriteStream(`./user_files/${filename}`);
        fs.unlink(`./user_files/${filename}`) //deleting created file
        console.error(err)
        return false
    });
}

sendDownloadFile = async(req, res, filename) => {
    try {
        var filePath = path.resolve(__dirname, `../user_files/${filename}`);
        console.log(filePath)
        var stat = await fs.promises.stat(filePath)
        console.log(`sendFilesoDownload => ${stat}`)
        if (!stat.isFile) {
            res.statusCode = StatusCodes.BAD_REQUEST
            json.responseJSON(res, { error: `not a file` })
            return
        }
        res.StatusCode = StatusCodes.OK
        var readableStream = fs.createReadStream(filePath).pipe(res);
    } catch (error) {
        console.log(error)
        console.log(error.message)
    }
}

module.exports = { getUploadFile, sendDownloadFile }