// taskDefinitions.js
const fetchArxivPapers = require('./arxivUtils');
const db = require('../database/db');

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

const arxivTask = {
    fetch: fetchArxivTask,
    process: processArxivTask,
};

module.exports = {
    arxivTask,
};
