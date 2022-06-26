const express = require('express');
const router = express.Router();

const pre_api = () => {

    router.get('/', async (req, res) => {
        res.send('I think you are looking for /api/:id :- :id here is your discord id');
    })
}

pre_api();
module.exports = router;