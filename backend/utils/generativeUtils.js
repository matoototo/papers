// generativeUtils.js
const { OpenAI } = require('openai');
const { encode } = require('gpt-tokenizer');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const trimText = (text, maxTokens) => {
    let trimmedText = text;
    while (encode(trimmedText).length > maxTokens) {
        trimmedText = trimmedText.slice(0, Math.floor(trimmedText.length * 0.98));
    }
    return trimmedText;
}

async function* streamSummary(text) {
    const trimmedText = trimText(text, 10000); // 10k is reasonable, avoid blowing up with really large papers
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
            "role": "user",
            "content": [
                {
                "type": "text",
                "text": "Please summarise, use $$$$ for equations and include equations if they best encapsulate the point. Start with the summary immediately, do not include any other text or repeat what I said. Use markdown. Top-level sections should be ### (h3). Have these sections:\nOutline (block of text that is a high level overview of the text, no bullet points. third person.) Key contributions (alternating freeflowing text and bullet points, don't just have bullet points. alternatively a Method section. attach equations here if suitable. please don't overdo equations, usually 0-2 is good.) Results (short rundown of improvements, don't overdo it. you can use markdown table if it's best represented as such) Conclusion (alternating freeflowing text and bullet points, don't just have bullet points.)\n\nHere is the text:\n" + trimmedText
                }
            ]
            }
        ],
        temperature: 0,
        max_tokens: 4095,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
    });

    for await (const chunk of response) {
        yield chunk.choices[0].delta.content;
    }
}

module.exports = {
    streamSummary,
};