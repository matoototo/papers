// taskDefinitions.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const db = require('../database/db');
const { fetchArxivPapers } = require('../utils/arxivUtils');
const { generateThumbnail, extractTextFromPDF } = require('../utils/thumbnailUtils');

const fetchArxivTask = async (lastExecutionTime) => {
    // const categories = ['cs.AI', 'stat.ML'];
    const categories = [];
    const papers = await fetchArxivPapers(lastExecutionTime, categories);
    return papers;
};

const processArxivTask = async (papers) => {
    for (const paper of papers) {
        const existingPaper = await db.getPaperByArxivId(paper.id);
        if (!existingPaper) {
            await db.insertPaperMetadata(paper);
        }
    }
};

const fetchThumbnailsTask = async () => {
    return await db.getPapersWithoutThumbnails();
};

const processThumbnailsTask = async (papers) => {
    for (const paper of papers) {
        const pdfPath = path.join('/tmp', `${paper.arxiv_id}.pdf`);
        let thumbnailPath = path.join('./thumbnails', `${paper.arxiv_id}.png`);

        try {
            const pdfUrl = paper.url.replace('abs', 'pdf').replace('arxiv.org', 'export.arxiv.org') + '.pdf';
            const response = await axios.get(pdfUrl, { responseType: 'stream' });
            // remove if exists, can happen if server crashes during processing
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            const writer = fs.createWriteStream(pdfPath);

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            if (!fs.existsSync(pdfPath)) {
                throw new Error(`Failed to download PDF: ${pdfPath}`);
            }

            thumbnailPath = await generateThumbnail(pdfPath, thumbnailPath);
            await db.updatePaperThumbnail(paper.id, thumbnailPath.replace('./thumbnails/', '/thumbnails/'));

            const paperText = await extractTextFromPDF(pdfPath);
            await db.updatePaperFullText(paper.id, paperText);

            fs.unlinkSync(pdfPath);
        } catch (error) {
            console.error(`Error processing paper ${paper.arxiv_id}:`, error);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

const fetchEmbeddingsTask = async () => {
    return await db.getPapersWithoutEmbeddings();
};

const processEmbeddingsTask = async (papers) => {
    const embeddingsHost = process.env.EMBEDDINGS_HOST || 'localhost';
    const embeddingsPort = process.env.EMBEDDINGS_PORT || 3002;
    const embeddingsEndpoint = `http://${embeddingsHost}:${embeddingsPort}/embed_text`
    const embeddingsSize = parseInt(process.env.EMBEDDINGS_SIZE) || 1024;

    for (const paper of papers) {
        try {
            const response = await axios.post(embeddingsEndpoint, {
                text: paper.abstract
            });

            const embedding = response.data.embedding;

            if (Array.isArray(embedding) && embedding.length === embeddingsSize) {
                await db.updatePaperEmbedding(paper.id, embedding);
            } else {
                console.error(`Invalid embedding for paper ${paper.arxiv_id}`);
            }
        } catch (error) {
            console.error(`Error generating embedding for paper ${paper.arxiv_id}:`, error);
        }
    }
};

const thumbnailerTask = {
    fetch: fetchThumbnailsTask,
    process: processThumbnailsTask,
};

const embeddingsTask = {
    fetch: fetchEmbeddingsTask,
    process: processEmbeddingsTask,
};

const arxivTask = {
    fetch: fetchArxivTask,
    process: processArxivTask,
};

module.exports = {
    arxivTask,
    thumbnailerTask,
    embeddingsTask,
};
