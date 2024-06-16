const { spawn } = require('child_process');

const startAIServer = () => {
    const process = spawn('sh', ['ai/start_server.sh']);

    process.stdout.on('data', (data) => {
        console.log(`AI server: ${data}`);
    });
    process.stderr.on('data', (data) => {
        const dataString = data.toString();
        if (dataString.includes('POST')) {
            console.log(`AI server: ${dataString}`);
        } else {
            console.error(`AI server: ${dataString}`);
        }
    });
    process.on('close', (code) => {
        console.log(`AI server process exited with code ${code}`);
    });

    return process;
};

module.exports = {
    startAIServer,
}
