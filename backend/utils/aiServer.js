const { spawn } = require('child_process');
const fetch = require('node-fetch');
const { encode } = require('gpt-tokenizer');
const { AI_HOST, AI_PORT } = process.env;

const AI_BASE = `http://${AI_HOST || 'localhost'}:${AI_PORT || 3002}`;

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

const getPreferenceEmbedding = async (preference) => {
    const response = await fetch(`${AI_BASE}/embed_preference/invoke`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: { preference } }),
    });

    if (!response.ok) {
        throw new Error('Failed to get embedding from AI backend');
    }

    const data = await response.json();
    return data.output;
};

const trimText = (text, maxTokens) => {
    let trimmedText = text;
    while (encode(trimmedText).length > maxTokens) {
        trimmedText = trimmedText.slice(0, Math.floor(trimmedText.length * 0.98));
    }
    return trimmedText;
}

async function* streamSummary(text) {
    const trimmedText = trimText(text, 7000);

    const response = await fetch(`${AI_BASE}/summarize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: trimmedText }),
    });

    for await (const chunk of response.body) {
        yield chunk;
    }
}

module.exports = {
    startAIServer,
    getPreferenceEmbedding,
    streamSummary,
}
