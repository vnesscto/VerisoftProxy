const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const forwardedPort = 4723;
const proxyHost = '127.0.0.1';
const proxyPort = 8888;

app.use(bodyParser.json());

app.all('*', (req, res) => {
    const options = {
        hostname: proxyHost,
        port: proxyPort,
        path: `${req.protocol}://${req.hostname}:${forwardedPort}${req.url}`,
        method: req.method,
        headers: {
            //...req.headers,
            'X-Custom-Header': 'Custom Value'
        }
    };

    const proxyRequest = http.request(options, (proxyResponse) => {
        let body = '';
        proxyResponse.on('data', (chunk) => {
            body += chunk;
        });

        proxyResponse.on('end', () => {
            res.status(proxyResponse.statusCode).send(req.body);
        });
    });

    proxyRequest.write(JSON.stringify(req.body));
    proxyRequest.end();
});

app.listen(port, () => {
    console.log(`Forwarding requests on port ${port}`);
});