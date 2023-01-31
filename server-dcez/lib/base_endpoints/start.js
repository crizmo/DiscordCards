const express = require('express');
const router = express.Router();
// const fs = require('fs');

const start = () => {

  router.get('/', async (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Discord Cards API</title>
            <style>
                body {
                    background-color: #fafafa;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Discord Cards API</h1>
            <p>
                The base endpoints are :-
                <ul>
                    <a href="/api">/api</a> <br>
                    <a href="/api/:id">/api/:id</a>
                </ul>
            </p>
        </body>
        </html>
        `;
    // fs.readFile('./lib/requests.json', 'utf8', (err, data) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         const requests = JSON.parse(data);
    //         if (requests.requests) {
    //             requests.requests += 1;
    //         } else {
    //             requests.requests = 1;
    //         }
    //         fs.writeFile('./lib/requests.json', JSON.stringify(requests), (err) => {
    //             if (err) {
    //                 console.log(err);
    //             } else {
    //                 console.log('User made a request in root \nTotal requests: ' + requests.requests);
    //             }
    //         });
    //     }
    // });

    res.send(html);
  })
}

start()
module.exports = router;