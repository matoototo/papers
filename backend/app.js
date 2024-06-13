// app.js
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
// const expressWs = require('express-ws')(app);

if (!fs.existsSync('./thumbnails')) {
    fs.mkdirSync('./thumbnails');
}
app.use('/thumbnails', express.static(path.join(__dirname, '/thumbnails')));

const papersRouter = require('./routes/papers');
const taskScheduler = require('./utils/taskScheduler');
const { arxivTask, thumbnailerTask } = require('./utils/taskDefinitions');

app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.use('/papers', papersRouter);

app.listen(PORT, async () => {
    const lastExecutionTime = new Date();
    lastExecutionTime.setDate(lastExecutionTime.getDate() - 7);

    await taskScheduler.runTaskOnce(arxivTask, lastExecutionTime.toISOString());
    await taskScheduler.runTaskOnce(thumbnailerTask, lastExecutionTime.toISOString());

    taskScheduler.addTask("*/10 * * * *", arxivTask, new Date().toISOString());
    taskScheduler.addTask("*/1 * * * *", thumbnailerTask, new Date().toISOString());
    taskScheduler.startAllTasks();

    console.log(`Server is running on port ${PORT}`);
});