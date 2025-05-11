const { Client, Location, Poll, List, Buttons, LocalAuth, MessageMedia } = require('./index');
const { getMessageMediaFromFilePath, createTextFile } =  require('./index');
const config = require('./config.json');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        //   args: [
        //     '--no-sandbox',
        //     '--disable-setuid-sandbox'
        //   ]      // OS Linux
    }
});

const fs = require('fs');
const path = require('path');
const crypto =  require('crypto');
global.__basedir = __dirname;

const express = require('express');
const app = express();

const HOST = config.server.host;
const PORT = config.server.port;

const apiKeys =  config.apiKeys;

app.use(express.json());

function checkApiKey(req, res, next) {
    const apiKey = req.query.api_key;

    if (!apiKey) {
        return res.status(401).json({ message: "API Key required" });
    }

    if (!apiKeys.includes(apiKey)) {
        return res.status(403).json({ message: "Invalid API Key" });
    }

    next();
}

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

let pairingCodeRequested = false;
client.on('qr', async (qr) => {
    console.log('QR RECEIVED', qr);

    const pairingCodeEnabled = false;
    if (pairingCodeEnabled && !pairingCodeRequested) {
        const pairingCode = await client.requestPairingCode('96170100100');
        console.log('Pairing code enabled, code: '+ pairingCode);
        pairingCodeRequested = true;
    }
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', async () => {
    console.log('READY');
    const debugWWebVersion = await client.getWWebVersion();
    console.log(`WWebVersion = ${debugWWebVersion}`);

    client.pupPage.on('pageerror', function(err) {
        console.log('Page error: ' + err.toString());
    });
    client.pupPage.on('error', function(err) {
        console.log('Page error: ' + err.toString());
    });
    
    app.post("/api/sendMessage", checkApiKey, (req, res) => {
        try {
            const { data } = req.body;
            const { number, message } = data;

            if (number && message) {
                client.sendMessage(`${number}@c.us`, message);
                console.log(`Successfully send message to ${number}`)

                res.status(200).json({ message: "Successfully send message" })
            };
        } catch (error) {
            console.log("error:", error)
            res.status(400).json({ error: error})
        }
    });

    app.post("/api/sendTextFile", checkApiKey, (req, res) => {
        try {
            const { data } = req.body;
            const { number, text, caption } = data;

            if (!number || !text) {
                res.status(400).json({ error: "Parameter number or text is empty" })
            }

            const randomString = crypto.randomBytes(8).toString('hex');
            const timestamp = Date.now();

            const tempPath = `temp/MessageMedia-${randomString}-${timestamp}.txt`;
            createTextFile(path.join(global.__basedir, tempPath), text);


            const media = getMessageMediaFromFilePath(path.join(global.__basedir, tempPath));

            if (caption) {
                client.sendMessage(`${number}@c.us`, media, { caption: caption });
            } else {
                client.sendMessage(`${number}@c.us`, media);
            }

            res.status(200).json({ message: "Successfuly send file" });
            console.log(`Sucessfully send file to ${number}`);
            fs.unlinkSync(path.join(global.__basedir, tempPath));
            console.log('File successfully deleted:', tempPath)
        } catch(error) {
            console.log("error:", error);
            res.status(400).json({ error: error });
        }
    });

    app.listen(PORT, HOST, () => {
        console.log(`Server running on http://${HOST}:${PORT}`);
    });
});

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    if (msg.body === '!ping reply') {
        msg.reply('pong');

    } else if (msg.body === '!ping') {
        client.sendMessage(msg.from, 'pong');

    } else if (msg.body.startsWith('!sendto ')) {
        let number = msg.body.split(' ')[1];
        let messageIndex = msg.body.indexOf(number) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        let chat = await msg.getChat();
        chat.sendSeen();
        client.sendMessage(number, message);
    }
});

let rejectCalls = true;

client.on('call', async (call) => {
    console.log('Call received, rejecting. GOTO Line 261 to disable', call);
    if (rejectCalls) await call.reject();
    await client.sendMessage(call.from, `[${call.fromMe ? 'Outgoing' : 'Incoming'}] Phone call from ${call.from}, type ${call.isGroup ? 'group' : ''} ${call.isVideo ? 'video' : 'audio'} call. ${rejectCalls ? 'This call was automatically rejected by the script.' : ''}`);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});