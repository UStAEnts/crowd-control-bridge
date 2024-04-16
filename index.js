// host web server
// Description: This file is the entry point for the web server. It creates an express app and listens on port 3000.
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});

const lighting = require('./lighting');

lighting();