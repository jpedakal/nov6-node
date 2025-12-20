require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./src/Routes');
const dbConnection = require('./src/dbConnection');
const bodyParser = require('body-parser');

dbConnection();

app.use(bodyParser.json());
app.use('/', router);

app.listen(3001, () => {
    console.log('Connected to Port 3001');
});
