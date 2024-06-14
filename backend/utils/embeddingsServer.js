const { spawn } = require('child_process');

const startEmbeddingsServer = () => {
    const process = spawn('sh', ['embeddings/start_server.sh']);

    process.stdout.on('data', (data) => {
        console.log(`Embedding server: ${data}`);
    });
    process.stderr.on('data', (data) => {
        const dataString = data.toString();
        if (dataString.includes('POST')) {
            console.log(`Embedding server: ${dataString}`);
        } else {
            console.error(`Embedding server: ${dataString}`);
        }
    });
    process.on('close', (code) => {
        console.log(`Embedding server process exited with code ${code}`);
    });

    return process;
};

module.exports = {
    startEmbeddingsServer,
}
