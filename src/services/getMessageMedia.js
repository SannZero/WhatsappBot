const fs = require('fs');
const path = require('path');
const MessageMedia = require('../structures/MessageMedia');

function getMessageMediaFromFilePath(filePath, mimetype = 'text/plain') {
    if (!fs.existsSync(filePath)) {
        throw new Error('File not found: ' + filePath);
    }

    const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
    const fileName = path.basename(filePath);
    const stat = fs.statSync(filePath);

    const media = new MessageMedia(mimetype, fileData, fileName);
    media.filesize = stat.size;

    return media;
}

module.exports = getMessageMediaFromFilePath;
