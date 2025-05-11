const fs = require('fs');
const path = require('path');

function createTextFile(filePath, content) {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('File successfully created:', filePath)
}

module.exports = createTextFile;