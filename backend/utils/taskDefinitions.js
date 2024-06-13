// taskDefinitions.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const db = require('../database/db');
const { fetchArxivPapers } = require('../utils/arxivUtils');
const { generateThumbnail } = require('../utils/thumbnailUtils');

const fetchArxivTask = async (lastExecutionTime) => {
    const categories = ['cs.AI', 'stat.ML'];
    const papers = await fetchArxivPapers(lastExecutionTime, categories);
    return papers;
};

const processArxivTask = async (papers) => {
    for (const paper of papers) {
        const existingPaper = await db.getPaperByArxivId(paper.id);
        if (!existingPaper) {
            await db.insertPaper(paper);
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

        // Download PDF temporarily
        const pdfUrl = paper.url.replace('abs', 'pdf') + '.pdf';
        const response = await axios.get(pdfUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(pdfPath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        thumbnailPath = await generateThumbnail(pdfPath, thumbnailPath);
        await db.updatePaperThumbnail(paper.id, thumbnailPath.replace('./thumbnails/', '/thumbnails/'));

        fs.unlinkSync(pdfPath);
    }
};

const thumbnailerTask = {
    fetch: fetchThumbnailsTask,
    process: processThumbnailsTask,
};

const arxivTask = {
    fetch: fetchArxivTask,
    process: processArxivTask,
};

module.exports = {
    arxivTask,
    thumbnailerTask,
};
