const express = require('express');
const router = express.Router();

router.get('/ping', (req,res) => {
    res.send('You pinged the server!');
});

module.exports = router;