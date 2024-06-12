// app.js

const express = require('express');
require('dotenv').config();

const app = express();
// const expressWs = require('express-ws')(app);
const bodyParser = require('body-parser');

const papersRouter = require('./routes/papers');


app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.use('/papers', papersRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
