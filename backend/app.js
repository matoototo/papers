// app.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// const expressWs = require('express-ws')(app);

const papersRouter = require('./routes/papers');
const taskScheduler = require('./utils/taskScheduler');
const { arxivTask } = require('./utils/taskDefinitions');

app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.use('/papers', papersRouter);

app.listen(PORT, () => {
    const lastExecutionTime = new Date();
    lastExecutionTime.setDate(lastExecutionTime.getDate() - 7);
    taskScheduler.addTask("*/10 * * * *", arxivTask, lastExecutionTime.toISOString());
    taskScheduler.startAllTasks();

    console.log(`Server is running on port ${PORT}`);
});
