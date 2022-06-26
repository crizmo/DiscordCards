const express = require('express');
const router = express.Router();

const start = () => {

    router.get('/', async (req, res) => {
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Breeze API</title>
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
            <h1>Welcome to Breeze API</h1>
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
        res.send(html);
    })
}

start()
module.exports = router;