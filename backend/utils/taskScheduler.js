const cron = require('node-cron');

const tasks = [];

const addTask = (cronExpression, taskFunctions, initialLastExecutionTime = new Date().toISOString()) => {
    let lastExecutionTime = initialLastExecutionTime;

    const task = cron.schedule(cronExpression, async () => {
        try {
            const currentExecutionTime = new Date().toISOString();
            const data = await taskFunctions.fetch(lastExecutionTime);
            taskFunctions.process(data);
            lastExecutionTime = currentExecutionTime;
        } catch (error) {
            console.error('Task execution failed:', error);
        }
    });

    tasks.push(task);
};

const runTaskOnce = async (taskFunctions, lastExecutionTime = new Date().toISOString()) => {
    try {
        const data = await taskFunctions.fetch(lastExecutionTime);
        taskFunctions.process(data);
    } catch (error) {
        console.error('Task execution failed:', error);
    }
};

const startAllTasks = () => {
    tasks.forEach(task => task.start());
};

const stopAllTasks = () => {
    tasks.forEach(task => task.stop());
};

module.exports = {
    addTask,
    startAllTasks,
    stopAllTasks,
    runTaskOnce,
};