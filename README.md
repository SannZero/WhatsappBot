<div align="center">
    <br />
    <p>
        <a href="https://wwebjs.dev"><img src="https://github.com/wwebjs/logos/blob/main/4_Full%20Logo%20Lockup_Small/small_banner_blue.png?raw=true" title="whatsapp-web.js" alt="WWebJS Website" width="500" /></a>
    </p>
    <br />
</div>


### Installation: 
```powershell
git clone https://github.com/SannZero/WhatsappBot.git
npm install
```

### Usage:
```powershell
node server
```

### Example Request API:
URL: ``http://localhost:3000/api/xx?api_key=API_KEY``

### Curl:
```powershell
curl -X POST "http://localhost:3000/api/sendMessage?api_key=API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"data":{"number":"628123456789","message":"Hello World!"}}'
```


### Configuration: config.json
